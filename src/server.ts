import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import * as AWS from './aws'
import fs from 'fs';
import https from 'https';
import url_module from "url";


function uploadImage(url: string, data: Buffer) {

  const options = {
    hostname: url_module.parse(url).host,
    path: url_module.parse(url).path,
    url: url,
    method: 'PUT',
    headers: {
      'Content-Type': 'image/jpeg'
    }
  }

  const req = https.request(options, (res: any) => {
    console.log(`statusCode: ${res.statusCode}`)

    res.on('data', (d: any) => {
      process.stdout.write(d)
    })
  })

  req.on('error', (error: any) => {
    console.error(error)
  })

  req.end(data);
}

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  //! END @TODO1
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );

  app.get('/filteredimage',
    async (req, res) => {
      const { image_url } = req.query;

      if ( !image_url ) {
        return res.status(422)
                  .send('image_url required');
      }
      const image_path: string = await filterImageFromURL(image_url);
      const key: string = image_path.split('/').pop();

      const put_url: string = AWS.getPutSignedUrl(key);

      fs.readFile(image_path, (err: Error, data: Buffer) => {
        if (!err) {
          uploadImage(put_url, data);
        }
      });
      const get_url = AWS.getGetSignedUrl(key);

      return res.status(200)
                .send(get_url)
                .end(deleteLocalFiles([image_path]));
    }

  );

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();
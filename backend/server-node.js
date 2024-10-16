const http = require('http')

const hostname = "localhost";
const port = 3000;

const server = http.createServer(
    (req,res)=>{
      if (req.url === '/') {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain');
          res.end('Hello welcome to codewithsamir\n');
      }else if(req.url === '/about'){
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('thank you about page\n');
      }else{
        res.statusCode = 404
        res.setHeader('Content-Type', 'text/plain');
        res.end('404 page not found!\n');
      }
    }
);

server.listen(port,()=>{
    console.log(`Server running at http://${hostname}:${port}/`)
})
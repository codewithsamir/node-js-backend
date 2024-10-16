import {serve} from 'bun'


serve({
    fetch(request){
        const url = new URL(request.url);
        if(url.pathname === '/'){
            return new Response('Hello, World!', {status:200})
        }else if(url.pathname === '/test'){
            return new Response('test, World!', {status:200})
        }else{
            return new Response('404')
        }
    },
    port: 3000,
    hostname: 'localhost',
})
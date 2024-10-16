const fs = require('fs')
const os = require('os')
const EventEmitter = require('events')



class Logger extends EventEmitter {
    log(message){
        this.emit('message',{message});
    }
}


const logger = new Logger()

const logfile = './logger/eventlog.txt';

const logTofile = (event)=>{
    const logmessage = `${new Date().toISOString()} - ${event.message} \n`
    fs.appendFileSync(logfile, logmessage)
}


 logger.on('message',logTofile)
setInterval(
    ()=>{
        const memoryUsage = os.freemem() / os.totalmem() * 100
        logger.log(`current memory usage: ${memoryUsage.toFixed(2)}`)  
    }
    ,3000)

    logger.log('Application Started');
    logger.log('Application occured');
    

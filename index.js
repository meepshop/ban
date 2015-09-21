import Redis from 'ioredis'
import cron from 'cron'
import cp from 'child_process'
import config from './config'
import Debug from 'debug'

let log = Debug('index.js')
let client = Redis(config.redis)

let job = new cron.CronJob('* * * * * *', async () => {
  log('doing job')
  let result = await client.zrangebyscore(config.redisKey, 0, 0)
  log('result => ', result)
  result.forEach((ip) => {
    log(`sudo iptables -A INPUT -s ${ip} -j DROP`)
    cp.spawnSync(`sudo iptables -A INPUT -s ${ip} -j DROP`, {stdio: 'inherit'})
  })
  log('job done')
}, null, true, 'Asia/Taipei')

job.start()

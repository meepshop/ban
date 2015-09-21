import Redis from 'ioredis'
import cron from 'cron'
import cp from 'child_process'
import config from './config'
import Debug from 'debug'

let log = Debug('index.js')
let client = Redis(config.redis)

let job = new cron.CronJob(config.cronjobString, async () => {
  log('doing job')
  let ips = await client.zrangebyscore(config.redisKey, 0, 0)
  log('ips => ', ips)
  for (var i = 0, len = ips.length; i < len; i++) {
    log(`sudo iptables -A INPUT -s ${ips[i]} -j DROP`)
    cp.spawnSync(`sudo iptables -A INPUT -s ${ips[i]} -j DROP`, {stdio: 'inherit'})
    await client.zadd(config.redisKey, 1, ips[i])
  }
  log('job done')
}, null, true, 'Asia/Taipei')

job.start()

module.exports = {
  apps : [{
    name   : "VisionGoal",
    script : "./dist/server.js",
    env_production : {
      NODE_ENV : "production"
    }
    
  }]
}

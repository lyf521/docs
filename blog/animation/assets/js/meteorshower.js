// 设定流星雨降落坐标--类
class Crood {
  constructor(x = 0, y = 0) {
    this.x = x
    this.y = y
  }
  setCrood (x, y) {
    this.x = x
    this.y = y
  }
  copy () {
    return new Crood(this.x, this.y)
  }
}

// 设定一个流星的运动轨迹--类
class ShootingStar {
  constructor (init = new Crood, final = new Crood, size = 1, speed = 200, onDistory = null) {
    this.init = init // 初时位置
    this.final = final // 最终位置
    this.size = size // 大小
    this.speed = speed // 速度：像素/s
    // 飞行总时间，坐标间的直线距离除以速度 Math.pow(x,y)这个函数是求x的y次方 Math.sqrt(x) 参数 x 的平方根。如果 x 小于 0，则返回 NaN
    this.dur = Math.sqrt(Math.pow(this.final.x - this.init.x, 2) + Math.pow(this.final.y - this.init.y, 2)) * 1000/this.speed

    this.pass = 0 // 已过去的时间
    this.prev = this.init.copy() // 上一帧位置
    this.now = this.init.copy() // 当前位置
    this.onDistory = onDistory // callback参数
  }

   /**
    * canvas画流星，每次在上次的坐标位置运动一定时间
    * @param ctx（canvas对象）
    * @param delta（每次运行时间）
    */
  draw (ctx, delta) {
    this.pass += delta
    this.pass = Math.min(this.pass, this.dur)

    let percent = this.pass / this.dur

     // 上次流行的位置坐标
    this.now.setCrood(
      this.init.x + (this.final.x - this.init.x) * percent,
      this.init.y + (this.final.y - this.init.y) * percent
    )

    // canvas画单独一个星星的样子
    ctx.strokeStyle = '#fff'
    ctx.lineCap = 'round'   // 绘制圆形的结束线帽
    ctx.lineWidth = this.size // 线宽
    ctx.beginPath()
    ctx.moveTo(this.now.x, this.now.y)
    ctx.lineTo(this.prev.x, this.prev.y)
    ctx.stroke()

      // 运行过的时间等于 该轨迹总时间时销毁
    this.prev.setCrood(this.now.x, this.now.y)
    if (this.pass === this.dur) {
      this.distory()
    }
  }
  distory() {
    this.onDistory && this.onDistory()
  }
}

// 设置流星雨--类
class MeteorShower {
  constructor(cvs, ctx) {
    this.cvs =cvs
    this.ctx = ctx
    this.stars = []
    this.T
    this.stop = false
    this.playing = false
  }

  // 新增星星
  createStar() {
    let angle = Math.PI / 3 // 圆周率，也即是180度，流星运动轨迹角度为60度
    let distance = Math.random() * 400 // 随机运行一段距离
    let init = new Crood(Math.random() * this.cvs.width | 0, Math.random() * 100 | 0) // 初使随机位置
    let final = new Crood(init.x + distance * Math.cos(angle), init.y + distance * Math.sin(angle))
    let size = Math.random() * 2
    let speed = Math.random() * 400 + 100
    let star = new ShootingStar(
      init,
      final,
      size,
      speed,
      () => {this.remove(star)}
    )
    return star
  }

  // 坐标不在移动的时候，移除坐标
  remove(star) {
    this.stars = this.stars.filter((s) => {return s !== star})
  }

  // 数量小于20时，新增
  updata(delta) {
    if (!this.stop && this.stars.length < 20) {
      this.stars.push(this.createStar())
    }
    this.stars.forEach((star) => {
      star.draw(this.ctx, delta)
    })
  }

  // 采用requestAnimationFrame() 画帧动画，设定帧时间
  tick() {
    if (this.playing) return // 判定是否在执行当中,不可多重执行
    this.playing = true

    let now = (new Date()).getTime()
    let last = now
    let delta // 时间间隔

    let _tick = () => {
      if (this.stop && this.stars.length === 0) {
        cancelAnimationFrame(this.T)
        this.playing = false
        return
      }

      // 获取帧时间,30到16之间
      delta = now - last
      delta = delta > 500 ? 30 : (delta < 16 ? 16: delta)
      last = now

       if(!window.requestAnimationFrame){
          window.requestAnimationFrame = (
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.msRquestAniamtionFrame ||
            window.oRequestAnimationFrame ||
            function (callback){
               return setTimeout(callback,Math.floor(1000/60))
            }
          )
       }
      this.T = requestAnimationFrame(_tick)
       // setTimeout(_tick,1000)
      ctx.save()
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)' // 每一帧用 “半透明” 的背景色清除画布
      ctx.fillRect(0, 0, cvs.width, cvs.height)
      ctx.restore()
      this.updata(delta)
    }

    _tick()
  }

  // 开始状态 -- 出发tick() 开始画星星
  start () {
    this.stop = false
    this.tick()
  }

  stop () {
    this.stop = true
  }
}

// effet
let cvs = document.querySelector('canvas')
cvs.width = cvs.width*2
cvs.height = cvs.height*2
let ctx = cvs.getContext('2d')
ctx.scale(2,2)

let meteorShower = new MeteorShower(cvs, ctx)
meteorShower.start()
// let T
// let shootingStar = new ShootingStar(
//   new Crood(100, 100),
//   new Crood(400, 400),
//   3,
//   200,
//   () => {cancelAnimationFrame(T)}
// )

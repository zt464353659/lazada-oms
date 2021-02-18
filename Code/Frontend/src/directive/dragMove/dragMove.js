export default {
  bind(el, binding, vnode, oldVnode) {
    const dialogHeaderEl = el.querySelector('.el-dialog__header')
    const dragDom = el.querySelector('.el-dialog')
    dialogHeaderEl.style.cursor = 'move'
    // 获取原有属性 ie dom元素.currentStyle 火狐谷歌 window.getComputedStyle(dom元素, null);
    const sty = dragDom.currentStyle || window.getComputedStyle(dragDom, null)
    dialogHeaderEl.onmousedown = (e) => {
      const defaultTop = Number(document.defaultView.getComputedStyle(dragDom, null).marginTop.replace('px', ''))
      // 鼠标按下，计算当前元素距离可视区的距离
      const disX = e.clientX - dialogHeaderEl.offsetLeft
      const disY = e.clientY - dialogHeaderEl.offsetTop
      // 获取到的值带px 正则匹配替换
      let styL, styT
      // 注意在ie中 第一次获取到的值为组件自带50% 移动之后赋值为px
      if (sty.left.includes('%')) {
        styL = +document.body.clientWidth * (+sty.left.replace(/\%/g, '') / 100)
        styT = +document.body.clientHeight * (+sty.top.replace(/\%/g, '') / 100)
      } else {
        styL = +sty.left.replace(/\px/g, '')
        styT = +sty.top.replace(/\px/g, '')
      }

      document.onmousemove = function(e) {
        // 通过事件委托，计算移动的距离
        const l = e.clientX - disX
        const t = e.clientY - disY
        // 移动当前元素
        let lmove = l + styL
        let tmove = t + styT
        const maxLeft = (window.innerWidth - dialogHeaderEl.offsetWidth) / 2
        const minTop = defaultTop
        const maxTop = window.innerHeight - minTop - dragDom.offsetHeight
        if (lmove < -maxLeft) {
          lmove = -maxLeft
        }
        if (lmove > maxLeft) {
          lmove = maxLeft
        }
        if (tmove < -minTop) {
          tmove = -minTop
        }
        if (tmove > maxTop) {
          tmove = maxTop
        }
        dragDom.style.left = `${lmove}px`
        dragDom.style.top = `${tmove}px`
      }

      document.onmouseup = function(e) {
        document.onmousemove = null
        document.onmouseup = null
      }
    }
  },
  unbind(el) {
    const dragDom = el.querySelector('.el-dialog')
    dragDom.style.left = `0px`
    dragDom.style.top = `0px`
  }
}


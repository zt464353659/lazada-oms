export function resultAlert(res, nextFun) {
  const msg = { text: '', status: false }
  const list = res.length ? res : res.data
  Vue._.forEach(list, item => {
    if (item.status) {
      msg.text += `<i class="el-icon-success" style="color:#67c23a"></i>`
      msg.status = true
    } else {
      msg.text += `<i class="el-icon-error" style="color:#f56c6c"></i>`
    }
    msg.text += `<span style="padding-left:10px">ID:${ item.istore_product_id } ${ item.message }</span><br/>`
  })
  MessageBox.alert(msg.text, '执行结果', {
    confirmButtonText: '确定',
    dangerouslyUseHTMLString: true,
    callback: action => {
      if (nextFun) {
        nextFun(msg.status)
      }
      document.body.classList.remove('el-popup-parent--hidden')
    }
  })
}

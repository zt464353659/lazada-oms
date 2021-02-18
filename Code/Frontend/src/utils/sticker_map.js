const { tarsiers_ph } = require('./stickerGroup/tarsiers_ph')
const { orangutan_my_new } = require('./stickerGroup/orangutan_my_new')
const { shrimp_sg_new } = require('./stickerGroup/shrimp_sg_new')
const { shogi_th } = require('./stickerGroup/shogi_th')
const { shogi2 } = require('./stickerGroup/shogi2')
const { shogi3 } = require('./stickerGroup/shogi3')
const { shrimp_tw } = require('./stickerGroup/shrimp_tw')
const { shrimp_id_new } = require('./stickerGroup/shrimp_id_new')
const sticker_map = {
  'my': orangutan_my_new,
  'ph': tarsiers_ph,
  'sg': shrimp_sg_new,
  'th': {
    site_code: 'th',
    imgArr: shogi_th.imgArr.concat(shogi2.imgArr, shogi3.imgArr)
  },
  'tw': shrimp_tw,
  'id': shrimp_id_new
}
export {
  sticker_map
}

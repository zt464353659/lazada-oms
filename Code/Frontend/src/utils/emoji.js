//所有表情

const emojiList = [
  {
    'name': 'angry',
    'label': 'angry',
    'value': 'Angry.png',
    'address': require('@/assets/emoji/Angry.png'),
    'imgUrl':'https://sg-live.slatic.net/original/3825aa88b59a9209053655fede4d1131.png',
    'smallImgUrl':'https://sg-live.slatic.net/original/633bee4754d1e298dbf3a38053c75dd5.png'
  },
  {
    'name': 'bye',
    'label': 'bye',
    'value': 'Bye.gif',
    'address': require('@/assets/emoji/Bye.gif'),
    'imgUrl':'https://sg-live.slatic.net/other/im/2a693f4624ae1491d6ba5743fd8a3ee9.gif',
    'smallImgUrl':'https://sg-live.slatic.net/other/im/94cbeb5083a622e4d400e489371bbc14.png'
  },
  {
    'name': 'cheer up',
    'label': 'cheerup',
    'value': 'Cheer up.gif',
    'address': require('@/assets/emoji/Cheer up.gif'),
    'imgUrl':'https://sg-live.slatic.net/other/im/901116c5359491b3bfe57fdb299f893f.gif',
    'smallImgUrl':'https://sg-live.slatic.net/other/im/5e917d78922de317df3a25c2a3c13aa6.png'
  },
  {
    'name': 'confused',
    'label': 'confused',
    'value': 'Confused.png',
    'address': require('@/assets/emoji/Confused.png'),
    'imgUrl': 'https://sg-live.slatic.net/original/1eca1d0994cb93f2df2408ffa749c18d.png',
    smallImgUrl: 'https://sg-live.slatic.net/[original/2e13c266a9e7fdd4d2a840e2a1939dd9.png'
  },
  {
    'name': 'crying',
    'label': 'crying',
    'value': 'Crying.png',
    'address': require('@/assets/emoji/Crying.png'),
    'imgUrl': 'https://sg-live.slatic.net/original/6c7e93fd7740f72bfbccff77504a30d9.png',
    smallImgUrl: 'https://sg-live.slatic.net/original/[b37b721709875f5c4e245cf331da2987.png'
  },
  {
    'name': 'dance',
    'label': 'dance',
    'value': 'Dance.gif',
    'address': require('@/assets/emoji/Dance.gif'),
    'imgUrl':'https://sg-live.slatic.net/other/im/a87ad57918b0d593fbd97381afcbe5cf.gif',
    'smallImgUrl':'https://sg-live.slatic.net/other/im/c90c72a4a3f2fd71514cde42ee91a6bb.png'
  },
  {
    'name': 'disgust',
    'label': 'disgust',
    'value': 'Disgust.png',
    'address': require('@/assets/emoji/Disgust.png'),
    'imgUrl':'https://sg-live.slatic.net/original/5b23d7bee1985418de4a084e72c16e47.png',
    'smallImgUrl':'https://sg-live.slatic.net/original/e398d006343bfdf2efd665ac726604b3.png'
  },
  {
    'name': 'fountain',
    'label': 'fountain',
    'value': 'Fountain.gif',
    'address': require('@/assets/emoji/Fountain.gif'),
    'imgUrl':'https://sg-live.slatic.net/other/im/3d09b64b8fb3599e11f38602a080fc3e.gif',
    'smallImgUrl':'https://sg-live.slatic.net/other/im/ee2d4cacb05ae9b26f56052d9bd782cc.png'},
  {
    'name': 'gift',
    'label': 'gift',
    'value': 'Gift.gif',
    'address': require('@/assets/emoji/Gift.gif'),
    'imgUrl':'https://sg-live.slatic.net/other/im/d9155fd8aff7b428d17c47d5fd8e9642.gif',
    'smallImgUrl':'https://sg-live.slatic.net/other/im/36d49a2e1eb206160f7de6a4d1000e73.png'
  },
  {
    'name': 'happy',
    'label': 'happy',
    'value': 'Happy.png',
    'address': require('@/assets/emoji/Happy.png'),
    'imgUrl': 'https://sg-live.slatic.net/original/0e048d1c6d42835cdc386241b2a855c8.png',
    smallImgUrl: 'https://sg-live.slatic.net/[original/30ff084a270eae973a02ec74e216ba51.png'
  },
  {
    'name': 'heart',
    'label': 'heart',
    'value': 'Heart.png',
    'address': require('@/assets/emoji/Heart.png'),
    'imgUrl':'https://sg-live.slatic.net/original/9715a92a20bc87a07988eb4825bf15ca.png',
    'smallImgUrl':'https://sg-live.slatic.net/original/012b57eeed968cf2787cd944ab733427.png'
  },
  {
    'name': 'inlove',
    'label': 'inlove',
    'value': 'In Love.png',
    'address': require('@/assets/emoji/In Love.png'),
    'imgUrl': 'https://sg-live.slatic.net/original/c1af284b49ca2855b6250da001eb86ff.png',
    smallImgUrl: 'https://sg-live.slatic.net/[original/87b1950d4a6f7e02d08065f2d2e9189c.png'
  },
  {
    'name': 'laughing',
    'label': 'laughing',
    'value': 'Laughing.png',
    'address': require('@/assets/emoji/Laughing.png'),
    'imgUrl': 'https://sg-live.slatic.net/original/d66d57245a5a53bfce17c7ee9f305dea.png',
    smallImgUrl: 'https://sg-live.slatic.net/original/[0bbb09ff7d823c4566044b615c0c214c.png'
  },
  {
    'name': 'Lazzie gift',
    'label': 'lazziegift',
    'value': 'Lazzie gift',
    'address': require('@/assets/emoji/Lazzie gift.png'),
    'imgUrl':'https://sg-live.slatic.net/other/im/9f13596921fa5b2000a8266b557018a9.png',
    'smallImgUrl':'https://sg-live.slatic.net/other/im/b079af4db32da2e90ef8e394018958f3.png'},
  {
    'name': 'Lazzie heart',
    'label': 'lazzieheart',
    'value': 'Lazzie heart.png',
    'address': require('@/assets/emoji/Lazzie heart.png'),
    'imgUrl':'https://sg-live.slatic.net/other/im/b8fb565cb055897c3029b7cd011c9a6b.png',
    'smallImgUrl':'https://sg-live.slatic.net/other/im/dfb9e3ffcb5f9ee243276d4ad33eeb57.png'},
  {
    'name': 'Lazzie yeah',
    'label': 'lazzieyeah',
    'value': 'Lazzie yeah.png',
    'address': require('@/assets/emoji/Lazzie yeah.png'),
    'imgUrl':'https://sg-live.slatic.net/other/im/9506b5dfcad5de538d711dca50b379f3.png',
    'smallImgUrl':'https://sg-live.slatic.net/other/im/f4ed96d29cbd41f16c30ec712c5cd9db.png'},
  {
    'name': 'red pocket',
    'label': 'redpocket',
    'value': 'Red pocket.gif',
    'address': require('@/assets/emoji/Red pocket.gif'),
    'imgUrl':'https://sg-live.slatic.net/other/im/2ef57a7e72c344f5347da78efc704451.gif',
    'smallImgUrl':'https://sg-live.slatic.net/other/im/72c2d2a7da6b3481c9c19fe62fb17a3d.png'},
  {
    'name': 'sad',
    'label': 'sad',
    'value': 'Sad.png',
    'address': require('@/assets/emoji/Sad.png'),
    'imgUrl': 'https://sg-live.slatic.net/original/1ba2df5142564a44966551027b9c6bbc.png',
    smallImgUrl: 'https://sg-live.slatic.net/original/[a17e7b66e101f6eafff7ea27f63f31e6.png'
  },
  {
    'name': 'shocked',
    'label': 'shocked',
    'value': 'Shocked.png',
    'address': require('@/assets/emoji/Shocked.png'),
    'imgUrl': 'https://sg-live.slatic.net/original/e795a481618af187f6b7df0f68feb527.png',
    smallImgUrl: 'https://sg-live.slatic.net/original/[b96d057d60b5d4df9471f6d021b10830.png'
  },
  {
    'name': 'shy',
    'label': 'shy',
    'value': 'Shy.png',
    'address': require('@/assets/emoji/Shy.png'),
    imgUrl: 'https://sg-live.slatic.net/original/cc2b0c1db5ae9014de532155fb114a3e.png',
    smallImgUrl: 'https://sg-live.slatic.net/[original/5986d2f2c30c09a981bf971485285aeb.png'
  },
  {
    'name': 'sleepy ',
    'label': 'sleepy',
    'value': 'Sleepy.gif',
    'address': require('@/assets/emoji/Sleepy.gif'),
    'imgUrl':'https://sg-live.slatic.net/other/im/8cef0edb766d587e2cfd29c67e6a48e4.gif',
    'smallImgUrl':'https://sg-live.slatic.net/other/im/a278243d7012ae9bef524c11fc56ded6.png'},
  {
    'name': 'smirking',
    'label': 'smirking',
    'value': 'Smirking.png',
    'address': require('@/assets/emoji/Smirking.png'),
    'imgUrl': 'https://sg-live.slatic.net/original/35f56b5e6b4cb8cd7ece01a486990758.png',
    smallImgUrl: 'https://sg-live.slatic.net/original/[f62c5bdb92d703450d58733928a5e08e.png'
  },
  {
    'name': 'surprised',
    'label': 'surprised',
    'value': 'Surprised.png',
    'address': require('@/assets/emoji/Surprised.png'),
    'imgUrl': 'https://sg-live.slatic.net/original/ed3e32239214313a5f88b7f5522e8009.png',
    smallImgUrl: 'https://sg-live.slatic.net/[original/81272c3b99b9ae6b719647ec68ab222d.png'
  },
  {
    'name': 'thank you',
    'label': 'thankyou',
    'value': 'Thank you.gif',
    'address': require('@/assets/emoji/Thank you.gif'),
    'imgUrl':'https://sg-live.slatic.net/other/im/ac34173dd76c7b099064aa0859d9aeb8.gif',
    'smallImgUrl':'https://sg-live.slatic.net/other/im/55db78f572521414ef5b98c1dfddf63f.png'
  },
  {
    'name': 'thirsty',
    'label': 'thirsty',
    'value': 'Thirsty.gif',
    'address': require('@/assets/emoji/Thirsty.gif'),
    'imgUrl':'https://sg-live.slatic.net/other/im/c999fa373bab823d8c3f1256d0e810cd.gif',
    'smallImgUrl':'https://sg-live.slatic.net/other/im/6eaa18380e90d049228221d6425f8a7d.png'},
  {
    'name': 'thumbsup',
    'label': 'thumbsup',
    'value': 'Thumbs Up.png',
    'address': require('@/assets/emoji/Thumbs Up.png'),
    'imgUrl': 'https://sg-live.slatic.net/original/41bbcbce0b13176ad4cfa9781a935f30.png',
    smallImgUrl: 'https://sg-live.slatic.net/original/[f82b6725f3618cb4e9a90a35d043a75f.png'
  },
  {
    'name': 'veryhappy',
    'label': 'veryhappy',
    'value': 'Very Happy.png',
    'address': require('@/assets/emoji/Very Happy.png'),
    'imgUrl': 'https://sg-live.slatic.net/original/bc42a3eff1a2ea9cda78e70ba85ca600.png',
    smallImgUrl: 'https://sg-live.slatic.net/original/[bfc697859931b2257f956680bff82a47.png'
  },
  {
    'name': 'yummy',
    'label': 'yummy',
    'value': 'Yummy.gif',
    'address': require('@/assets/emoji/Yummy.gif'),
    'imgUrl':'https://sg-live.slatic.net/other/im/122730d703f7ca3b27c73a97788eef9a.gif',
    'smallImgUrl':'https://sg-live.slatic.net/other/im/cb9f07cb5c7f6801ea1ce830d3397bd4.png'
  },
  {
    'name': 'Christmas',
    'label': 'christmas',
    'value': 'Christmas.png',
    'address': require('@/assets/emoji/Christmas.png'),
    'imgUrl':'https://sg-live.slatic.net/other/im/1461eb044cbe81614582a83e8efa7bf7.png',
    'smallImgUrl':'https://sg-live.slatic.net/other/im/ca0af297239dd70e507fbd80ccc28f84.png'}
]

// 匹配表情url
export function findEmoji(emojiName) {
  let address = ''
  emojiList.forEach(item => {
    if (item.label === emojiName) {
      address = item.address
    }
  })
  return address
}

// 表情包
export function emojiPackage() {
  return emojiList.filter(item => item.name !== 'your' && item.name !== 'me')
}


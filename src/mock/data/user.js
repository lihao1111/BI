import Mock from 'mockjs'
const LoginUsers = [
  {
    id: 1,
    name: '张某某',
    gender: '1',
    username: 'admin',
    password: '123456',
    group_id: '1'
  }
]

const editUser = {
  id: 1,
  name: '张xxx',
  gender: '0',
  username: 'admin',
  password: '123456',
  group_id: '1'
}

const Users = []

for (let i = 0; i < 86; i++) {
  Users.push(Mock.mock({
    id: Mock.Random.guid(),
    name: Mock.Random.cname(),
    addr: Mock.mock('@county(true)'),
    'age|18-60': 1,
    birth: Mock.Random.date(),
    sex: Mock.Random.integer(0, 1)
  }))
}
// Apps 产品视图
const Apps = []

for (let i = 0; i < 4; i++) {
  Apps.push(Mock.mock({
    appId: Mock.Random.guid(),
    name: Mock.Random.cname()
  }))
}

// 在线用户
const userList = []
for (let i = 0; i < 24; i++) {
  userList.push(Mock.mock({
    day: '2019-06-20',
    hour: i + 1,
    count: 100 + i
  }))
}

// 对比数据
const compareList = []
for (let i = 0; i < 24; i++) {
  compareList.push(Mock.mock({
    day: '2019-06-21',
    hour: i + 1,
    count: 200 + i
  }))
}

export { LoginUsers, Users, Apps, userList, compareList, editUser }

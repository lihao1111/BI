<template>
  <section>
    <h1>{{this.$store.state.count}}</h1>
    <h1>{{this.$store.getters.getCount}}</h1>
    <p>count的值：{{this.$store.state.count}}</p>
    <button @click="addFun">+</button>
    <button @click="reduceFun">-</button>
    <h1>{{count1}}</h1>
  </section>
</template>
<script>
import { mapState } from 'vuex'
export default {
  data () {
    return {
      filters: {
        name: ''
      },
      loading: false,
      users: []
    }
  },
  computed: {
    ...mapState({ // 对象扩展符 ...用于取出参数对象中的所有可遍历属性，拷贝到当前对象中
      count1: state => state.count // 使用count1 来对等 state.count数据
    })
  },
  methods: {
    addFun () {
      // this.$store.commit('add') // 提交 mutations中的方法 add
      this.$store.dispatch('add') // 使用dispath 提交action中的add方法
    },
    reduceFun () {
      this.$store.dispatch('reduction')
    }
  },
  created () {
    const arr1 = [1, 2] // 复制数组的问题
    const arr2 = arr1
    const arr3 = [...arr1] // 复制数组 改变值 不受影响
    arr2[0] = 2
  },
  mounted () {
  }
}

</script>

<style scoped>

</style>

<template>
  <div>
    <!-- 录入表单 -->
    <form id="form">
      <h3>学生信息录入</h3>
      <table align="center" cellpadding="5">
        <tbody>
          <tr>
            <td align="right"><label for="avatar">学生头像：</label></td>
            <td align="left"><input id="avatar" type="file" ref="avatar" accept="image/*" /></td>
          </tr>
          <tr>
            <td align="right"><label for="name"><i style="color:red;">*&nbsp;</i>学生姓名：</label></td>
            <td align="left"><input id="name" type="text" v-model="studentInfo.name"></td>
          </tr>
          <tr>
            <td align="right"><label for="age"><i style="color:red;">*&nbsp;</i>学生年龄：</label></td>
            <td align="left"><input id="age" type="number" v-model.number="studentInfo.age"></td>
          </tr>
          <tr>
            <td align="right"><label for="idcard"><i style="color:red;">*&nbsp;</i>学生身份证：</label></td>
            <td align="left"><input id="idcard" type="text" v-model="studentInfo.idcard"></td>
          </tr>
          <tr>
            <td><input type="submit" value="添加" @click.prevent="addStudent"></td>
            <td><input type="reset" value="重置" @click="resetFields"></td>
          </tr>
        </tbody>
      </table>
    </form>
    <!-- 列表 -->
    <section id="list">
      <h3>{{searching?`搜索结果(共${searchList.length}名)`:`学生列表(共${studentList.length}名)`}}</h3>
      <p style="text-align:left;">
        <input type="text" placeholder="输入学生姓名搜索" v-model="keyword" @keyup.enter="search">
      </p>
      <table align="center">
        <thead>
          <tr>
            <th>ID</th>
            <th>头像</th>
            <th>姓名</th>
            <th>年龄</th>
            <th>身份证</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in searching?searchList:studentList" :key="item.id">
            <td>{{item.id}}</td>
            <td><img :src="item.avatar_url" alt="头像"></td>
            <td>{{item.name}}</td>
            <td>{{item.age}}</td>
            <td>{{item.idcard}}</td>
            <td><button @click="delStudent(item.id)">删除</button></td>
          </tr>
        </tbody>
      </table>
      <p v-if="searching?!searchList.length:!studentList.length">-- 暂无数据 —-</p>
    </section>
  </div>
</template>

<script>
const DB_NAME = 'WEB_STORE_DEMO' // 数据库名
const DB_VERSION = 1 // 数据库版本
const DB_STORE_NAME = 'STUDENT_TABLE' // 表名
var db // 数据库
export default {
  data () {
    return {
      // 学生录入表单的数据
      studentInfo: {
        name: null,
        age: null,
        idcard: null
      },
      // 是否在搜索状态
      searching: false,
      // 搜索关键字
      keyword: '',
      // 全部学生列表
      studentList: [],
      // 搜索结果
      searchList: []
    }
  },
  mounted () {
    if (!window.indexedDB && !window.mozIndexedDB && !window.webkitIndexedDB && !window.msIndexedDB) {
      alert('您的浏览器暂不支持 IndexedDB！')
      return
    }
    // 初始化 IndexedDB 之后获取全部学生列表
    this.initDB().then(() => {
      this.getStudentList()
    })
  },
  methods: {
    // 初始化 IndexedDB，异步操作
    initDB () {
      return new Promise((resolve, reject) => {
        console.log('initDB ...')
        let request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onsuccess = (event) => {
          console.log('initDB success')
          db = event.target.result
          resolve(db)
        }

        request.onerror = (event) => {
          console.warn('initDB error', event.target.error)
          reject(event.target.error)
        }

        request.onupgradeneeded = (event) => {
          console.log('initDB upgradeneeded')
          // 如果 DB_STORE_NAME 表不存在，则创建
          if (!event.target.result.objectStoreNames.contains(DB_STORE_NAME)) {
            let store = event.target.result.createObjectStore(DB_STORE_NAME, { keyPath: 'id', autoIncrement: true }) // id自增
            store.createIndex('name', 'name', { unique: false })
            store.createIndex('age', 'age', { unique: false })
            store.createIndex('idcard', 'idcard', { unique: true }) // idcard唯一
          }
        }
      })
    },
    // 新增单条学生数据
    addStudent () {
      if (!this.studentInfo.name || !this.studentInfo.age || !this.studentInfo.idcard) {
        alert('请完整填写表单')
        return
      }
      if (!db) {
        console.warn('IndexedDB 尚未初始化')
        return
      }
      console.log('addStudent ...', this.studentInfo, this.$refs.avatar.files)

      let insertData = (studentInfo) => {
        // 创建事务并添加学生数据
        let tx = db.transaction(DB_STORE_NAME, 'readwrite')
        let store = tx.objectStore(DB_STORE_NAME)
        let request = store.add(studentInfo)

        request.onsuccess = (event) => {
          console.log('新增成功')
          // 重置表单并重新获取列表
          document.querySelector("input[type='reset']").click()
          this.getStudentList()
          // 如果在搜索状态下，回到正常状态
          if (this.searching) {
            this.keyword = ''
            this.searching = false
          }
        }
        request.onerror = (event) => {
          console.warn('新增失败', event.target.error)
        }
      }
      // 如果存在头像，则将头像文件转化为ArrayBuffer进行存储
      if (this.$refs.avatar.files.length) {
        let fileReader = new FileReader()
        // Blob to ArrayBuffer, 兼容safari浏览器, 如果不考虑safari可以直接将文件存储在IndexedDB中
        fileReader.readAsArrayBuffer(this.$refs.avatar.files[0])
        fileReader.onload = (event) => {
          insertData(Object.assign(this.studentInfo, {
            avatar: event.target.result
          }))
        }
      } else {
        insertData(this.studentInfo)
      }
    },
    // 获取学生列表
    getStudentList () {
      if (!db) {
        console.warn('IndexedDB 尚未初始化')
        return
      }
      console.log('getStudentList ...')
      let _studentList = []

      let tx = db.transaction(DB_STORE_NAME, 'readonly')
      let store = tx.objectStore(DB_STORE_NAME)
      let request = store.openCursor()

      request.onsuccess = (event) => {
        let cursor = event.target.result
        if (cursor) {
          // ArrayBuffer to Blob 并创建blob访问地址
          if (cursor.value.avatar) {
            cursor.value.avatar_url = window.URL.createObjectURL(new Blob([cursor.value.avatar]))
          }
          _studentList.push(cursor.value)
          cursor.continue()
        } else {
          console.log('遍历完毕：', _studentList)
          this.studentList = _studentList
        }
      }
      request.onerror = (event) => {
        console.warn('获取学生列表失败：', event.target.error)
      }
      /**
       * 可以通过此方法直接获取列表总数，以供参考
       * let request = store.count()
       * request.onsuccess = (event) => {
       *   let totalCount = event.target.result
       * }
       */
    },
    // 搜索
    search () {
      if (!db) {
        console.warn('IndexedDB 尚未初始化')
        return
      }
      if (!this.keyword) {
        this.searching = false
        return
      }
      console.log('search ...')
      this.searching = true
      let _searchList = []

      let tx = db.transaction(DB_STORE_NAME, 'readonly')
      let store = tx.objectStore(DB_STORE_NAME)
      let indexed = store.index('name')
      let request = indexed.openCursor(IDBKeyRange.only(this.keyword)) // 完全匹配keyword

      request.onsuccess = (event) => {
        let cursor = event.target.result
        if (cursor) {
          if (cursor.value.avatar) {
            cursor.value.avatar_url = window.URL.createObjectURL(new Blob([cursor.value.avatar]))
          }
          _searchList.push(cursor.value)
          cursor.continue()
        } else {
          console.log('遍历完毕：', _searchList)
          this.searchList = _searchList
        }
      }
      request.onerror = (event) => {
        console.warn('搜索失败：', event.target.error)
      }
    },
    // 删除学生
    delStudent (id) {
      if (!db) {
        console.warn('IndexedDB 尚未初始化')
        return
      }
      console.log('delStudent ...', id)

      let tx = db.transaction(DB_STORE_NAME, 'readwrite')
      let store = tx.objectStore(DB_STORE_NAME)
      let request = store.get(id)

      request.onsuccess = (event) => {
        let record = event.target.result
        console.log('待删除的学生', record)
        if (record !== undefined && window.confirm(`您确定要删除${record.name}吗`)) {
          request = store.delete(id)
          request.onsuccess = (event) => {
            console.log('删除成功')
            this.searching ? this.search() : this.getStudentList()
          }
          request.onerror = (event) => {
            console.warn('删除失败:', event.target.error)
          }
        }
      }
      request.onerror = (event) => {
        console.warn('获取待删除的学生数据失败', event.target.error)
      }
    },
    // 重置表单
    resetFields () {
      // https://github.com/vuejs/vue/issues/833
      this.studentInfo = {
        name: null,
        age: null,
        idcard: null
      }
    }
  }
}
</script>

<style scoped>
#form,
#list {
  border: 1px solid #cccccc;
  border-radius: 5px;
  width: 600px;
  margin: 20px auto;
  padding: 10px 15px;
}

#form input[type='text'],
#form input[type='number'] {
  width: 160px;
}

#list input[type='text'] {
  width: 140px;
  height: 20px;
  border-radius: 5px;
  padding: 5px;
  border: 1px solid #cccccc;
  outline: none;
}

#list table {
  border: 1px solid #cccccc;
  border-radius: 5px;
}

#list table thead tr th {
  width: 100px;
}

#list table tbody tr td {
  width: 100px;
  border-top: 1px solid #cccccc;
  padding: 5px 10px;
}

#list table thead tr th:not(:last-of-type) {
  border-right: 1px solid #cccccc;
}

#list table tbody tr td:not(:last-of-type) {
  border-right: 1px solid #cccccc;
}

img {
  max-height: 50px;
}
</style>

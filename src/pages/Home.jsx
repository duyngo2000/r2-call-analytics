import React, { useEffect, useState } from "react"
import styled from "styled-components"
import { Link } from "react-router-dom"
import { useRef } from "react"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { url, urlList } from "../contants/url"
import { tadaData } from "../contants/addData"

const Container = styled.div`
  display: flex;
`
const WrapperToast = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
`
const Wrapper = styled.div`
  background-color: #fff;
  width: 30%;
  height: 300px;
  margin: 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`
const Item = styled.div`
  margin-bottom: 15px;
`
const Title = styled.label`
  display: block;
`
const Input = styled.input`
  width: 300px;
  height: 30px;
`
const Table = styled.table`
  padding: 0;
  width: 60%;
`
const Tr = styled.tr`
  border: 1px solid #fff;
`
const Th = styled.th`
  border: 1px solid #fff;
`
const Td = styled.td`
  border: 1px solid #fff;
`
const Button = styled.button`
  width: 300px;
  height: 40px;
  cursor: pointer;
`

const Home = () => {
  const [listAudioID, setListAudioID] = useState([])
  const [postData, setPostData] = useState()
  const [count, setCount] = useState(0)
  const [fileName, setFileName] = useState("")
  const [abc, setAbc] = useState([])
  const [listData, setListData] = useState([])
  const index = useRef(0)

  useEffect(() => {
    fetch(urlList)
      .then((response) => response.json())
      .then((json) => {
        setListAudioID(json)
      })
      .catch((err) => {
        getAllDataIndexDB()
        console.log("Request Failed", err)
      })
  }, [])

  useEffect(() => {
    for (const data of listAudioID) {
      fetch(url + data)
        .then((response) => response.json())
        .then((json) => {
          addManyDataIndexDB(json)
        })
        .catch((err) => {
          getAllDataIndexDB()
          console.log("Request Failed", err)
        })
    }
  }, [listAudioID])

  const getAllDataIndexDB = () => {
    const indexedDB = window.indexedDB
    const request = indexedDB.open("cars", 1)
    request.onerror = function (e) {
      console.error("error", e)
    }
    request.onupgradeneeded = function () {
      const db = request.result
      db.createObjectStore("cars", { keyPath: "id" })
    }
    request.onsuccess = function () {
      const db = request.result
      const transaction = db.transaction("cars", "readwrite")
      const store = transaction.objectStore("cars")

      const getAllDataIndexDB = store.getAll()
      getAllDataIndexDB.onsuccess = function () {
        console.log("getAllDataIndexDB.result", getAllDataIndexDB.result)
        setListData(getAllDataIndexDB.result)
      }
      transaction.oncomplete = function () {
        db.close()
      }
    }
  }

  const backgroundSyncAdd = () => {
    navigator.serviceWorker.ready.then((swRegistration) =>
      swRegistration.sync.register("post-data").catch((err) => console.log(err))
    )
  }

  const addData = (data, post, deleted) => {
    const indexedDB = window.indexedDB

    const request = indexedDB.open("cars", 1)
    request.onerror = function (e) {
      console.error("error")
      console.error(e)
    }
    request.onupgradeneeded = function () {
      const db = request.result
      const store = db.createObjectStore("cars", { keyPath: "id" })
      store.createIndex("cars_colour", ["colour"], { unique: false })
      store.createIndex("cars_colour_make", ["colour", "make"], {
        unique: false,
      })
    }
    request.onsuccess = function () {
      const db = request.result
      const transaction = db.transaction("cars", "readwrite")
      const store = transaction.objectStore("cars")
      store.put({
        id: data.audioID,
        data: data,
        post: post,
        delete: deleted,
      })

      transaction.oncomplete = function () {
        db.close()
      }
    }
  }
  const addManyDataIndexDB = (data) => {
    // console.log(data)
    const indexedDB = window.indexedDB

    const request = indexedDB.open("cars", 1)
    request.onerror = function (e) {
      console.error("error")
    }
    request.onupgradeneeded = function () {
      const db = request.result
      db.createObjectStore("cars", { keyPath: "id", autoIncrement: true })
    }
    request.onsuccess = function () {
      const db = request.result
      const transaction = db.transaction("cars", "readwrite")

      const store = transaction.objectStore("cars")
      store.put({
        id: data.audioID,
        data: data,
      })
      const getAllDataIndexDB = store.getAll()
      getAllDataIndexDB.onsuccess = function () {
        setListData(getAllDataIndexDB.result)
      }
      transaction.oncomplete = function () {
        db.close()
      }
    }
  }

  const sendDataServer = (data) => {
    console.log("data", data)
    fetch(url + fileName, {
      method: "POST",
      body: JSON.stringify(data),
      mode: "no-cors",
      headers: { "Content-type": "application/json; charset=UTF-8" },
    })
      .then((response) => {
        setFileName("")
        addData(data, false, false)
        setListData((prev) => [...prev, { id: fileName, data: data }])
        toast("Thêm dữ liệu thành công!")
        response.json()
      })
      .then((json) => console.log(json))
      .catch((err) => {
        console.log(err)
        setFileName("")
        addData(data, true, false)
        backgroundSyncAdd()
        toast("Thêm dữ liệu thành công!")
        setListData((prev) => [...prev, { id: fileName, data: data }])
      })
  }
  // console.log("listData", listData)
  const handleAdd = () => {
    sendDataServer(tadaData(fileName))
  }
  /////////////////////////////////////////////////////////

  const backgroundSyncDelete = () => {
    navigator.serviceWorker.ready.then((swRegistration) =>
      swRegistration.sync
        .register("delete-data")
        .catch((err) => console.log(err))
    )
  }

  const deleteData = (data, deletee) => {
    //id: 1
    // console.log(data)

    if (deletee === true) {
      //lúc online
      // xóa data
      const indexedDB = window.indexedDB
      const request = indexedDB.open("cars", 1)
      request.onerror = function (e) {
        console.error("error")
        console.error(e)
      }
      request.onupgradeneeded = function () {
        const db = request.result
        db.createObjectStore("cars", { keyPath: "id" })
      }
      request.onsuccess = function () {
        const db = request.result
        const transaction = db.transaction("cars", "readwrite")
        const store = transaction.objectStore("cars")
        store.delete(data.id)
      }
    } else {
      //lúc offline
      // thêm store mới tên deletecars

      const indexedDB = window.indexedDB
      const request = indexedDB.open("deletecars", 1)
      request.onerror = function (e) {
        console.error("error", e)
      }
      request.onupgradeneeded = function () {
        const db = request.result
        db.createObjectStore("cars", { keyPath: "id" })
      }
      request.onsuccess = function () {
        const db = request.result
        const transaction = db.transaction("cars", "readwrite")
        const store = transaction.objectStore("cars")

        const indexedDB2 = window.indexedDB
        const request2 = indexedDB2.open("cars", 1)
        request2.onerror = function (e) {
          console.error("error")
          console.error(e)
        }
        request2.onupgradeneeded = function () {
          const db2 = request2.result
          db2.createObjectStore("cars", { keyPath: "id" })
        }
        request2.onsuccess = function () {
          const db2 = request2.result
          const transaction2 = db2.transaction("cars", "readwrite")
          const store2 = transaction2.objectStore("cars")
          store2.delete(data.id)
        }
        store.put({
          id: data.id,
          data: data,
        })
        transaction.oncomplete = function () {
          db.close()
        }
      }
    }
  }
  const sendDeleteData = (data) => {
    console.log(data)
    fetch(url + "de-audioID_" + data.id, {
      method: "POST",
      mode: "no-cors",
    })
      .then((response) => {
        setCount((prev) => prev + 1)
        toast("Xóa dữ liệu thành công!")
        setListData(listData.filter((item) => item.id !== data.id))
        deleteData(data, true)
        response.json()
      })
      .then((json) => console.log(json))
      .catch((err) => {
        console.log(err)
        deleteData(data, false)
        backgroundSyncDelete()
        toast("Xóa dữ liệu thành công!")
        setListData(listData.filter((item) => item.id !== data.id))
      })
  }

  const handleDelete = (data) => {
    console.log(data)
    index.current += 1
    sendDeleteData(data)
  }
  return (
    <Container>
      <WrapperToast>
        <ToastContainer />
      </WrapperToast>
      {/* <Table border={1}>
        <Tr>
          <Th>ID</Th>
          <Th>name</Th>
          <Th>email</Th>
          <Th>content</Th>
          <Th>created at</Th>
        </Tr>
        {listAudioID.length >= 0 &&
          listAudioID.map((item) => (
            <Tr key={item._id}>
              <Td>
                <Link to={`audioID=${item._id}`}>{item._id}</Link>
              </Td>
              <Td>{item.name}</Td>
              <Td>{item.email}</Td>
              <Td>{item.content}</Td>
              <Td>{item.createdAt}</Td>
              <Td>
                <button onClick={() => handleDelete(item)}>X</button>{" "}
              </Td>
            </Tr>
          ))}
      </Table>
      <Wrapper>
        <Item>
          <Title>Name</Title>
          <Input
            onChange={(e) => {
              setPostData({
                name: e.target.value,
                email: postData.email,
                content: postData.content,
                delete: false,
              })
            }}
            value={postData.name}
          />
        </Item>
        <Item>
          <Title>Email</Title>
          <Input
            onChange={(e) => {
              setPostData({
                name: postData.name,
                email: e.target.value,
                content: postData.content,
                delete: false,
              })
            }}
            value={postData.email}
          />
        </Item>
        <Item>
          <Title>Content</Title>
          <Input
            onChange={(e) =>
              setPostData({
                name: postData.name,
                email: postData.email,
                content: e.target.value,
                delete: false,
              })
            }
            value={postData.content}
          />
        </Item>
        <Button onClick={handleAdd}>add</Button>
      </Wrapper> */}
      <Table border={1}>
        <Tr>
          <Th>ID voice</Th>
          <Th>ID Agent</Th>
          <Th>Agent name</Th>
          <Th>ID Customer</Th>
          <Th>Customer name</Th>
          <Th>date</Th>
          <Th>call hold duration</Th>
          <Th>call duration</Th>
        </Tr>
        {listData.length >= 0 &&
          listData.map((item) => (
            <Tr key={item.data.audioID}>
              <Td>
                <Link to={`audioID_${item.data.audioID}`}>
                  {item.data.audioID}
                </Link>
              </Td>
              <Td>{item.data.audioCredit.agent.agentID}</Td>
              <Td>{item.data.audioCredit.agent.name}</Td>
              <Td>{item.data.audioCredit.customer.customerID}</Td>
              <Td>{item.data.audioCredit.customer.name}</Td>
              <Td>{item.data.audioCredit.date}</Td>
              <Td>{item.data.audioCredit.callHoldDration}</Td>
              <Td>{item.data.audioCredit.callDuration}</Td>
              <Td>
                <button onClick={() => handleDelete(item)}>X</button>{" "}
              </Td>
            </Tr>
          ))}
      </Table>
      <Wrapper>
        <label htmlFor="" style={{ fontSize: "20px" }}>
          nhập audioID <span style={{ color: "red" }}>(là số)</span>{" "}
        </label>
        <input
          type="text"
          onChange={(e) => setFileName(e.target.value)}
          value={fileName}
        />
        <button type="submit" onClick={handleAdd}>
          add
        </button>{" "}
      </Wrapper>
      {/*<Table border={1}>
        <Tr>
          <Th>ID voice</Th>
        </Tr>
        {listAudioID.length >= 0 &&
          listAudioID.map((item) => (
            <Tr key={item}>
              <Td>
                <Link to={`${item}`}>{item}</Link>
              </Td>
              <Td>
                <button onClick={() => handleDelete(item)}>X</button>{" "}
              </Td>
            </Tr>
          ))}
      </Table> */}
    </Container>
  )
}

export default Home

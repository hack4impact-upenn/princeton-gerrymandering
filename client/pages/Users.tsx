import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom'

import secureRequest from '../util/secureRequest';
import isAuthenticated from "../util/isAuthenticated";

import { Layout, Table, Button, Tag, Typography, Modal, Input, Form } from 'antd';

import { CloseOutlined, UserSwitchOutlined, UserAddOutlined } from '@ant-design/icons';
const { Content, Footer } = Layout;

import Navbar from "../components/Navbar";

const Users: React.FC = () => {
    const [users, setUsers] = useState([])

    const [addUserModalShowing, setAddUserModalShowing] = useState(false)
    const [newUsername, setNewUsername] = useState("")
    const [newUserPassword, setNewUserPassword] = useState("")
    const [addUserError, setAddUserError] = useState(null)

    const [changePasswordModalShowing, setChangePasswordModalShowing] = useState(false)
    const [changedPassword, setChangedPassword] = useState("")
    const [changePasswordUser, setChangedPasswordUser] = useState(null)

    const fetchUsers = () => {
        secureRequest("/user/all", "GET").then((data) => {
            setUsers(data.users)
        }).catch((error) => {
            console.log(error)
        })
    }

    useEffect(() => {
        fetchUsers()
    }, [])


    const deleteUser = (username) => {
        secureRequest("/user/delete", "DELETE", {
            "username": username
        }).then((data) => {
            fetchUsers()
        })
    }

    const addUser = () => {
        secureRequest("/user/add", "POST", {
            username: newUsername,
            password: newUserPassword
        }).then((data) => {
            fetchUsers()
            setAddUserModalShowing(false)
        }).catch((error) => {
            setAddUserError(error.message)
        })
    }

    const changePassword = () => {
        secureRequest("/user/change_password", "POST", {
            username: changePasswordUser,
            newPassword: changedPassword
        }).then( (data) => {
            setChangePasswordModalShowing(false)
        })
    }

    const columns = [
        {
            title: (
                <React.Fragment>
                    <Typography style={{ display: "inline" }}>Users</Typography>
                    <Button type="primary" style={{ margin: "auto 20px" }} icon={<UserAddOutlined />}
                        onClick={() => setAddUserModalShowing(true)}
                    >
                        Add User
                    </Button>
                </React.Fragment>
            ),
            key: "username",
            dataIndex: "username",
            align: "left" as "right" | "center" | "left" | undefined,
            render: (text, record) => {
                return (
                    <React.Fragment>
                        {text}
                        {record.admin &&
                            <Tag style={{ margin: "auto 20px" }} color="magenta">Admin</Tag>
                        }
                    </React.Fragment>
                )
            }
        },
        {
            title: "Actions",
            key: "actions",
            align: "right" as "right" | "center" | "left" | undefined,
            render: (text, record) => {
                return (
                    <React.Fragment>
                        <Button type="primary" icon={<UserSwitchOutlined />}
                            onClick = { () => {
                                setChangedPasswordUser(record.username)
                                setChangePasswordModalShowing(true)
                            }}
                        >
                            Change Password
                        </Button>
                        {!record.admin &&
                            <Button style={{ marginLeft: 20 }} type="primary" danger icon={<CloseOutlined />}
                                onClick = {() => deleteUser(record.username) }
                            >
                                Delete User
                            </Button>
                        }
                    </React.Fragment>
                )
            }
        }
    ]

    return (
        <Layout>
            <Navbar></Navbar>
            <Content className="site-layout" style={{ padding: 0, paddingBottom: 0, marginTop: 64 }}>
                <div className="site-layout-content" style={{ background: "#fff", padding: 24, margin: 50 }}>
                    <Table columns={columns} dataSource={users.map((user, ind) => {
                        return {
                            key: ind,
                            username: (user as any).username,
                            admin: (user as any).admin
                        }
                    })}>

                    </Table>

                    <Modal visible={addUserModalShowing} title="Add User" onOk={addUser} onCancel={() => setAddUserModalShowing(false)}>
                        <Form>

                            { addUserError &&
                                <Typography.Text type = "danger">{addUserError}</Typography.Text>
                            }

                            <Form.Item
                                name="username"
                                rules={[{ required: true, message: 'Please enter the new account username' }]}
                            >
                                <Input
                                    placeholder="Username"
                                    onChange={(e) => setNewUsername(e.target.value)}
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: 'Please enter the new account password' }]}
                            >
                                <Input.Password
                                    placeholder="Password"
                                    onChange={(e) => setNewUserPassword(e.target.value)}
                                />
                            </Form.Item>

                        </Form>

                    </Modal>


                    <Modal visible={changePasswordModalShowing} title="Add User" onOk={changePassword} onCancel={() => setChangePasswordModalShowing(false)}>
                        <Form>

                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: 'Please enter the new password' }]}
                            >
                                <Input.Password
                                    placeholder="Password"
                                    onChange={(e) => setChangedPassword(e.target.value)}
                                />
                            </Form.Item>

                        </Form>

                    </Modal>

                </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>The Hofeller Files</Footer>
        </Layout>
    )
}

export default Users
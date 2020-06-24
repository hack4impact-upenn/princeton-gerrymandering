import React from 'react';
import ReactDOM from 'react-dom'
import { Modal, Button, Select, Input } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';

const { Option } = Select;

interface AddTagsModalProps {
    documentId: string;
}

const AddTagsModal : React.FC = () => {
    const [tag, setTag] = useState<string | undefined>()
    const [newTag, setNewTag] = useState<any>()
    const [visisble, setVisible] = useState(false)

    const handleCancel = () => {
        setVisible(false);
    }

    const handleOk = () => {
        console.log(newTag)
        setVisible(false)
    }

    const selectBefore = (
        <Select value = {tag} placeholder = "Select a tag category" onChange = {(e) => setTag(e.toString())} style={{ minWidth: 168 }}  >
            <Option value = "locations">Locations</Option>
            <Option value = "people">People</Option>
            <Option value = "orgs">Organizations</Option>
            <Option value = "other">Other</Option>
        </Select>
    )
    return (
        <React.Fragment>
            <Button onClick = {() => setVisible(true)} style = {{border: 'none'}} icon = {<PlusCircleOutlined></PlusCircleOutlined>}></Button>
            <Modal title = "Add Tag" visible = {visisble} onOk = {handleOk} onCancel = {handleCancel} okText = "Add Tag">
                <Input addonBefore = {selectBefore} onChange = {(e) => setNewTag(e.target.value)}/>
            </Modal>
        </React.Fragment>
    )
}

export default AddTagsModal;
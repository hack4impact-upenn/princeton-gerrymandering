import React from 'react';
import ReactDOM from 'react-dom'
import { Modal, Button, Select, Input, Typography } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';
import secureRequest from '../util/secureRequest';

const { Option } = Select;

interface AddTagsModalProps {
    resourceId: string;
    refresh: () => void;
}

const AddTagsModal : React.FC<AddTagsModalProps> = ({ resourceId, refresh } : AddTagsModalProps) => {
    const [tagType, setTagType] = useState<string | undefined>()
    const [tagValue, setTagValue] = useState<any>()
    const [visisble, setVisible] = useState(false)
    const [error, setError] = useState(null)

    const handleCancel = () => {
        setVisible(false);
    }

    const handleOk = () => {
        secureRequest("/api/tags/add", "POST", {
            tagType,
            tagValue,
            resourceId
        }).then( (data) => {
            setVisible(false)
            refresh()
        }).catch( (error) => {
            console.log(error)
            setError(error.msg)
        })
    }

    const selectBefore = (
        <Select value = {tagType} placeholder = "Select a tag category" onChange = {(e) => setTagType(e.toString())} style={{ minWidth: 168 }}  >
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
                <Input addonBefore = {selectBefore} onChange = {(e) => setTagValue(e.target.value)}/>
                { error != null && 
                    <Typography.Text type = "danger">There was an issue with your request: {error}</Typography.Text>
                }
            </Modal>
        </React.Fragment>
    )
}

export default AddTagsModal;
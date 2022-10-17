import React, { useEffect, useRef, useState } from "react";
import { Alert, Button, Form, Input, Modal, Select } from "antd";
import { Block } from "../../utils/bem";

const { Option } = Select;

const API_GATEWAY = process.env.API_GATEWAY;

const MergeTopics = ({ item }) => {

  const [form] = Form.useForm();
  const [valuesForMerge,setValuesForMerge] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mergedSuccess, setMergedSuccess] = useState(false);

  const getProject = (url) => {
    const parts = url.split("/");

    return parseInt(parts[2]);
  };
  const project = getProject(window.location.pathname);

  const onReset = () => {
    form.resetFields();
  };


  const MergeAndDeleteTopics = async ( body ) => {
    const choices = [];

    body.merge_labels?.map((item)=>{
      //eslint-disable-next-line
      const oldChoice = `<Choice value=\"${item}\"/>`;
      
      choices.push(oldChoice);
    });

    let label_config;

    const getSettings = {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };

    await fetch(
      `${API_GATEWAY}/api/projects/${project}/`,
      getSettings,
    ).then(response => response.json())
      .then( async (data) => {
        label_config = data.label_config;
      });

    //eslint-disable-next-line
    const newChoice = `<Choice value=\"${body.new_label}\"/>`;

    choices.map((value,i)=>{
      if(i===0)
        label_config = label_config.replace(value,newChoice);
      else 
        label_config = label_config.replace(value,'');
    });

    const updatedBody = {
      label_config,
    };
    const patchSettings = {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body : JSON.stringify(updatedBody),
    };

    await fetch(
      `${API_GATEWAY}/api/projects/${project}/`,
      patchSettings,
    ).then(response => response.json())
      .then(data => {
        const updatedConfig = data.parsed_label_config.sentiment.labels;

        const values_after_merge = [];

        for (let i = 0; i < updatedConfig.length; i++) {
          values_after_merge.push({ value: updatedConfig[i] });
        }
        setValuesForMerge(values_after_merge);
      })
      .catch(e=>console.log(e));
  };

  const handleSubmit = async (values) => {

    values["project"] = project;

    const myBody = {
      project,
      merge_labels: values["Merge Topics"],
      new_label: values["New Topic Name"],
    };

    const settings = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(myBody),
    };

    try {
      const fetchResponse = await fetch(
        `${API_GATEWAY}/api/labels/merge/sentisum`,
        settings,
      );
      const data = await fetchResponse.json();

      form.resetFields();
      setMergedSuccess(true);
      MergeAndDeleteTopics(myBody);
      return data;

    } catch (e) {
      console.log(e);
      return e;
    }
  };

  
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  useEffect(()=>{
    for (let i = 0; i < item.children.length; i++) {
      valuesForMerge.push({ value: item.children[i].value });
    }
  },[]);

  const onclose = () => {
    setMergedSuccess(false);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    if(mergedSuccess)
      window.location = (`${window.location.href}`); 
    setIsModalOpen(false);
  };

  return (
    <>
      <Block name="mergeTopics">
        <Button type="primary" onClick={showModal}>
          Merge Topics
        </Button>
      </Block>
      <Modal title="Merge Topics" visible={isModalOpen} footer={null} width={800} onCancel={handleCancel}>
        {mergedSuccess ? (
          <>
            <Alert message="Success" type="success" closable onClose={onclose} />
            <br />
          </>
        ) : (
          ""
        )}
        <Form
          layout="vertical"
          name="basic"
          form={form}
          labelCol={{
            span: 12,
          }}
          wrapperCol={{
            span: 24,
          }}
          initialValues={{
            remember: true,
          }}
          onFinishFailed={onFinishFailed}
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            label="Merge Topics"
            name="Merge Topics"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select
              mode="multiple"
              showArrow
              style={{ width: "100%" }}
              placeholder="Select topics"
              options={valuesForMerge}
            />
          </Form.Item>
          <Form.Item
            label="New Topic Name"
            name="New Topic Name"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input placeholder="Enter your new topic name" />
          </Form.Item>

          <Form.Item
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
          >
            <Block name="button-row">
              <Button type="primary" htmlType="submit">
            Submit
              </Button>
              <Button htmlType="button" onClick={onReset}>
            Reset
              </Button>
            </Block>
          </Form.Item>
        </Form>
      </Modal>
      
    </>
  );
};

export { MergeTopics };

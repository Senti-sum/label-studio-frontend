import React, { useState } from "react";
import { Alert, Button, Form, Input, Select } from "antd";
import "./MergeChoices/MergeChoices.css";

const { Option } = Select;

const API_GATEWAY = process.env.API_GATEWAY;

const MergeTopics = ({ item }) => {

  const [form] = Form.useForm();
  const [mergedSuccess, setMergedSuccess] = useState(false);
  const getProject = (url) => {
    const parts = url.split("/");

    return parseInt(parts[2]);
  };
  const project = getProject(window.location.pathname);

  const onReset = () => {
    form.resetFields();
  };

  const handleSubmit = async (values) => {

    values["project"] = project;

    const myBody = {
      project,
      merge_labels: values["merge topics"],
      new_label: values["new topic name"],
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
      return data;

    } catch (e) {
      return e;
    }
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const values_for_merge = [];

  for (let i = 0; i < item.children.length; i++) {
    values_for_merge.push({ value: item.children[i].value });
  }
  const onclose = () => {
    setMergedSuccess(false);
  };

  return (
    <>
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
          name="merge topics"
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
            options={values_for_merge}
          />
        </Form.Item>
        <Form.Item
          label="New Topic Name"
          name="new topic name"
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
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Button htmlType="button" onClick={onReset}>
            Reset
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export { MergeTopics };

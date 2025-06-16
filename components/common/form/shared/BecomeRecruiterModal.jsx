import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, message, Select } from "antd";
import axios from "axios";
import { industryService } from "@/services/industryService";
import { userService } from "@/services/userService";
import locationService from "@/services/locationService";
import { CheckCircleOutlined } from '@ant-design/icons';
import './styles/_becomeRecruiterModal.scss';

const BecomeRecruiterModal = ({ open, onCancel, userId }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [requestSent, setRequestSent] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { 
    if (open) {
      locationService.getProvinces().then(data => {
        setProvinces(data);
      });
      fetchIndustries();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      const userIdLocal = localStorage.getItem('userId');
      if (userIdLocal && localStorage.getItem('recruiterRequestSent_' + userIdLocal) === '1') {
        setRequestSent(true);
      }
    }
  }, [open]);

  const fetchIndustries = async () => {
    try {
      const data = await industryService.getAll();
      setIndustries(data);
    } catch (err) {
      console.error("Error fetching industries:", err);
      setError("Failed to load industries");
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const userIdLocal = localStorage.getItem('userId');
      const payload = {
        userId: Number(userIdLocal),
        companyName: values.companyName,
        companyProfileDescription: values.companyProfileDescription,
        location: values.location,
        teamSize: values.teamSize,
        website: values.website,
        contact: values.contact,
        industryId: Number(values.industryId),
      };
      console.log('Payload gửi lên API:', payload);
      await userService.requestBecomeRecruiter(payload);
      message.success("Request sent successfully!");
      form.resetFields();
      setRequestSent(true);
      if (userIdLocal) localStorage.setItem('recruiterRequestSent_' + userIdLocal, '1');
    } catch (err) {
      console.error("Error submitting request:", err);
      // Only show a general error message if it's not a validation error
      if (!err.errorFields) {
        message.error("Failed to submit request");
      }
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div>{error}</div>;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      title="Become a Recruiter"
      okText="Submit"
      confirmLoading={loading}
      destroyOnHidden
      width={520}
      style={{ top: 10 }}
      styles={{ body: { overflowY: 'auto', maxHeight: '70vh' } }}
      footer={requestSent ? [
        <Button key="close" onClick={onCancel}>
          Close
        </Button>,
      ] : undefined}
      className="become-recruiter-modal"
    >
      {requestSent ? (
        <div className="success-message">
          <CheckCircleOutlined style={{ fontSize: 48, marginBottom: 20, color: '#52c41a' }} />
          We have received your request, please wait...
        </div>
      ) : (
        <Form
          form={form}
          layout="horizontal"
          labelCol={{ span: 7 }}
          wrapperCol={{ span: 17 }}
          className="become-recruiter-form"
        >
          <Form.Item label="Company Name" name="companyName" rules={[{ required: true, message: 'Please enter company name' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="companyProfileDescription" rules={[{ required: true, message: 'Please enter description' }]}>
            <Input.TextArea rows={6} />
          </Form.Item>
          <Form.Item label="Location" name="location" rules={[{ required: true, message: 'Please select location' }]}>
            <Select
              showSearch
              placeholder="Select a province/city"
              optionFilterProp="children"
              filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
            >
              {provinces.map((item) => (
                <Select.Option key={item.code} value={item.name}>{item.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Team Size" name="teamSize" rules={[{ required: true, message: 'Please enter team size' }]}>
            <Select placeholder="Select team size">
              <Select.Option value="50 - 100">50 - 100</Select.Option>
              <Select.Option value="100 - 150">100 - 150</Select.Option>
              <Select.Option value="200 - 250">200 - 250</Select.Option>
              <Select.Option value="300 - 350">300 - 350</Select.Option>
              <Select.Option value="500 - 1000">500 - 1000</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Website" name="website" style={{marginBottom: 20}}>
            <Input />
          </Form.Item>
          <Form.Item label="Contact" name="contact" rules={[{ required: true, message: 'Please enter contact' }]} style={{marginBottom: 20}}>
            <Input />
          </Form.Item>
          <Form.Item label="Industry" name="industryId" rules={[{ required: true, message: 'Please select industry' }]} style={{marginBottom: 20}}>
            <Select
              showSearch
              placeholder="Select industry"
              optionFilterProp="children"
              filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
            >
              {industries.map((item) => (
                <Select.Option key={item.industryId} value={item.industryId}>{item.industryName}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default BecomeRecruiterModal; 
import React, { useState, useEffect, useMemo } from 'react';
import { theme, ConfigProvider, Form, Input, Button, DatePicker, InputNumber, Select, Layout, Menu, ColorPicker } from 'antd';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { SettingOutlined } from '@ant-design/icons';

const { Content } = Layout;

const DataTable = ({ rowData }) => {
    const columnDefs = useMemo(() => [
        { headerName: 'Produktbezeichnung', field: 'productName', sortable: true, filter: true },
        { headerName: 'Modell-Nr', field: 'modelNumber', sortable: true, filter: true },
        { headerName: 'Hersteller', field: 'manufacturer', sortable: true, filter: true },
        { headerName: 'EAN', field: 'ean', sortable: true, filter: true },
        { headerName: 'Foto', field: 'photo', sortable: true, filter: true }
    ], []);

    const defaultColDef = useMemo(() => ({
        flex: 1,
        minWidth: 100,
        editable: true,
    }), []);

    return (
        <div className="ag-theme-alpine-dark" style={{ height: '400px', width: '100%', backgroundColor: 'black', color: 'lightgray' }}>
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                rowSelection="single"
                enableSorting={true}
                enableFilter={true}
                suppressRowClickSelection={true}
                domLayout='autoHeight'
                onCellValueChanged={(event) => {
                    console.log('Cell value changed:', event);
                }}
            />
        </div>
    );
};

const ItemForm = ({ onSubmit }) => {
    const [form] = Form.useForm();

    const handleSubmit = () => {
        form.validateFields()
            .then(values => {
                form.resetFields();
                onSubmit(values);
            });
    };

    return (
        <Form form={form} style={{ color: 'gray' }}>
            <Form.Item name="productName" label="Produktbezeichnung" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="modelNumber" label="Modell-Nr" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="manufacturer" label="Hersteller" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="ean" label="EAN" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="photo" label="Foto">
                <Input />
            </Form.Item>
            <Button onClick={handleSubmit}>Hinzufügen</Button>
        </Form>
    );
};

const App = () => {
    const [rowData, setRowData] = useState([]);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [primary, setPrimary] = useState('#1677ff');

    useEffect(() => {
        const storedData = JSON.parse(localStorage.getItem('items') || '[]');
        setRowData(storedData);
    }, []);

    const addItem = (item) => {
        const updatedRowData = [...rowData, item];
        setRowData(updatedRowData);
        localStorage.setItem('items', JSON.stringify(updatedRowData));
    };

    const navColorStyle = (index) => {
        const brightness = 100 - (index * 5);
        return { backgroundColor: primary, filter: `brightness(${brightness}%)` };
    };

    const colorPickerStyle = {
        backgroundColor: primary
    };

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: primary,
                },
                algorithm: theme.darkAlgorithm,
            }}
        >
            <Layout style={{ minHeight: '100vh', backgroundColor: 'black' }}>
                <Menu
                    theme="dark"
                    mode="horizontal"
                    defaultSelectedKeys={['2']}
                    style={{ backgroundColor: primary }}
                    onSelect={({ key }) => setSelectedMenu(key)}
                >
                    {[
                        'Start',
                        'Mails',
                        'Artikel eingeben',
                        'Artikel verwalten',
                        'eBay',
                        'Kleinanzeigen',
                        'Booklooker',
                    ].map((item, index) => (
                        <Menu.Item key={index + 1} style={navColorStyle(index)}>
                            {item}
                        </Menu.Item>
                    ))}
                    <Menu.Item key="8" style={navColorStyle(7)}>
                        <SettingOutlined />
                    </Menu.Item>
                    <div style={{ textAlign: 'center', width: '100%' }}>
                        <ColorPicker
                            showText
                            value={primary}
                            onChangeComplete={(color) => setPrimary(color.toHexString())}
                            style={colorPickerStyle}
                        />
                    </div>
                </Menu>
                <Content style={{
                    background: 'black',
                    color: 'gray',
                    marginLeft: '0%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '5%'
                }}>
                    {selectedMenu === '4' && <DataTable rowData={rowData} />}
                    {selectedMenu === '3' && <ItemForm onSubmit={addItem} />}
                </Content>
            </Layout>
        </ConfigProvider>
    );
};

export default App;

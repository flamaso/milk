import React, { useState, useEffect, useMemo } from 'react';
import { ConfigProvider, Form, Input, Button, Layout, Menu } from 'antd';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { SettingOutlined } from '@ant-design/icons';
import { MailOutlined } from '@ant-design/icons';
import { PlusOutlined, ContainerOutlined, ToolOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Content } = Layout;

const DataTable = ({ rowData, updateRowData }) => {
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
                    updateRowData(event.data);  // Aktualisieren des jeweiligen Datensatzes
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
        <Form form={form} >
            <Form.Item
                name="productName"
                label={<span style={{ color: 'gray' }}>Produktbezeichnung</span>}
                rules={[{ required: true }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="modelNumber"
                label={<span style={{ color: 'gray' }}>Modell-Nr</span>}
                rules={[{ required: true }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="manufacturer"
                label={<span style={{ color: 'gray' }}>Hersteller</span>}
                rules={[{ required: true }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="ean"
                label={<span style={{ color: 'gray' }}>EAN</span>}
                rules={[{ required: true }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="photo"
                label={<span style={{ color: 'gray' }}>Foto</span>}
            >
                <Input />
            </Form.Item>
            <Button onClick={handleSubmit}>Hinzufügen</Button>
        </Form>
    );
};

const MainMenu = ({ setSelectedMenu }) => {
    const [searchQuery, setSearchQuery] = useState('');  // Zustand für die Suchanfrage

    // Funktion zum Senden der Suchanfrage an das Backend
    const handleSearch = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/search/?query=${searchQuery}`);
            const data = await response.json();
            console.log("Suchergebnisse:", data);
        } catch (error) {
            console.error("Fehler bei der Suche:", error);
        }
    };

    return (
        <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['3']}
            onSelect={({ key }) => {
                if (key !== 'search') {  // Änderung hier
                    setSelectedMenu(key);
                }
            }}
        >
            <Menu.Item key="1">Start</Menu.Item>
            <Menu.Item key="2"><PlusOutlined /></Menu.Item>
            <Menu.Item key="3"><ContainerOutlined /></Menu.Item>
            <Menu.Item key="4">eBay</Menu.Item>
            <Menu.Item key="5">Kleinanzeigen</Menu.Item>
            <Menu.Item key="6">Booklooker</Menu.Item>
            <Menu.Item key="7"><MailOutlined /></Menu.Item>
            <Menu.Item key="8"><SettingOutlined /></Menu.Item>
            <Menu.Item key="search">
                <Input.Search
                    className="custom-input-focused"

                    placeholder="Suchen..."
                    onSearch={handleSearch}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ verticalAlign: 'middle' }}  // Änderung hier
                />
            </Menu.Item>
        </Menu>
    );
};
const App = () => {
    const [rowData, setRowData] = useState([]);
    const [selectedMenu, setSelectedMenu] = useState('3');

    useEffect(() => {
        const storedData = JSON.parse(localStorage.getItem('items') || '[]');
        setRowData(storedData);
    }, []);

    const addItem = (item) => {
        const updatedRowData = [...rowData, item];
        setRowData(updatedRowData);
        localStorage.setItem('items', JSON.stringify(updatedRowData));
    };

    const updateItem = (updatedItem) => {
        const updatedRowData = rowData.map(item =>
            item.modelNumber === updatedItem.modelNumber ? updatedItem : item
        );
        setRowData(updatedRowData);
        localStorage.setItem('items', JSON.stringify(updatedRowData));
    };

    return (
        <ConfigProvider>
            <Layout style={{ minHeight: '100vh', backgroundColor: 'black' }}>
                <MainMenu setSelectedMenu={setSelectedMenu} />


                <Content style={{
                    background: 'black',
                    color: 'gray',
                    marginLeft: '0%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '5%'
                }}>
                    {selectedMenu === '3' && <DataTable rowData={rowData} updateRowData={updateItem} />}
                    {selectedMenu === '2' && <ItemForm onSubmit={addItem} />}
                </Content>
            </Layout>
        </ConfigProvider>
    );
};

export default App;
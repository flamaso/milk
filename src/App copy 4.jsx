import React, { useState, useEffect, useRef, useMemo } from 'react';
import { theme, ConfigProvider, Form, Input, Button, DatePicker, InputNumber, Select, Layout, Menu, ColorPicker } from 'antd';
import moment from 'moment';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const { Header, Content } = Layout;

const DataTable = () => {
    const [rowData, setRowData] = useState([]);

    useEffect(() => {
        const storedData = JSON.parse(localStorage.getItem('milkPurchases') || '[]');
        setRowData(storedData);
    }, []);

    const columnDefs = useMemo(() => [
        { headerName: 'ID', field: 'id', sortable: true, filter: true },
        { headerName: 'Name', field: 'name', sortable: true, filter: true, editable: true },
        { headerName: 'Preis', field: 'price', sortable: true, filter: true, editable: true },
        { headerName: 'Menge (Liter)', field: 'liters', sortable: true, filter: true, editable: true },
        { headerName: 'Zeit/Datum', field: 'datetime', sortable: true, filter: true, editable: true },
    ], []);

    const defaultColDef = useMemo(() => ({
        flex: 1,
        minWidth: 100,
        editable: true,
    }), []);

    return (
        <div className="ag-theme-alpine" style={{ height: '400px', width: '100%' }}>
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                rowSelection="single"
                enableSorting={true}
                enableFilter={true}
                suppressRowClickSelection={true}
                onCellValueChanged={(event) => {
                    console.log('Cell value changed:', event);
                }}
            />
        </div>
    );
};



const MilkPurchaseForm = () => {
    const [namesList, setNamesList] = useState([]);
    const [datetime, setDatetime] = useState(moment());
    const [liters, setLiters] = useState(0);
    const [price, setPrice] = useState(0);
    const [primary, setPrimary] = useState('#1677ff');
    const formRef = useRef(null);

    useEffect(() => {
        const storedNames = JSON.parse(localStorage.getItem('namesList') || '[]');
        setNamesList(storedNames);
    }, []);

    const handleSubmit = (values) => {
        const { name, existingName } = values;
        const selectedName = name || existingName;
        if (selectedName && datetime && liters > 0 && price > 0) {
            const purchase = {
                name: selectedName,
                datetime: datetime.format('YYYY-MM-DD HH:mm:ss'),
                liters,
                price
            };
            saveData(purchase);
        } else {
            alert('Bitte alle Felder korrekt ausfüllen!');
        }
    };

    const saveData = (data) => {
        const currentData = JSON.parse(localStorage.getItem('milkPurchases') || '[]');
        currentData.push(data);
        currentData.sort((a, b) => moment(a.datetime).isBefore(moment(b.datetime)) ? -1 : 1);
        localStorage.setItem('milkPurchases', JSON.stringify(currentData));
        if (!namesList.includes(data.name)) {
            setNamesList(prevNames => [...prevNames, data.name]);
            localStorage.setItem('namesList', JSON.stringify([...namesList, data.name]));
        }
    };

    const generateCSV = () => {
        const purchases = JSON.parse(localStorage.getItem('milkPurchases') || '[]');
        if (purchases.length === 0) {
            alert('Keine Daten zum Exportieren vorhanden.');
            return;
        }
        let csvContent = 'Name,Datetime,Liters,Price\n';
        purchases.forEach(item => {
            csvContent += `${item.name},${item.datetime},${item.liters},${item.price}\n`;
        });
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'milkPurchases.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const dataSource = JSON.parse(localStorage.getItem('milkPurchases') || '[]');
    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Datetime', dataIndex: 'datetime', key: 'datetime' },
        { title: 'Liters', dataIndex: 'liters', key: 'liters' },
        { title: 'Price', dataIndex: 'price', key: 'price' }
    ];

    const navColorStyle = (index) => {
        const brightness = 100 - (index * 5);
        return { backgroundColor: primary, filter: `brightness(${brightness}%)` };
    };

    const colorPickerStyle = {
        backgroundColor: 'black'
    };

    return (
        <ConfigProvider
            theme={{
                token: {
                    // any theme overrides
                    colorPrimary: primary,
                },
                // this line sets it to dark mode
                algorithm: theme.darkAlgorithm,
            }}
        >
            <Layout style={{ minHeight: '100vh' }}>
                <Menu
                    theme="dark"
                    mode="horizontal"
                    defaultSelectedKeys={['2']}
                    style={{ backgroundColor: primary }}
                >
                    {[
                        'Start',
                        'Artikel eingeben',
                        'Artikel verwalten',
                        'eBay',
                        'Kleinanzeigen',
                        'Booklooker',
                        'Einstellungen',
                    ].map((item, index) => (
                        <Menu.Item key={index + 1} style={navColorStyle(index)}>
                            {item}
                        </Menu.Item>
                    ))}
                    <div style={{ textAlign: 'center', width: '100%' }}>
                        <Menu.Divider />
                    </div>
                </Menu>
                <Content style={{ background: 'black', color: 'gray', marginLeft: '5%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5%' }}>
                    <ColorPicker
                        showText
                        value={primary}
                        onChangeComplete={(color) => setPrimary(color.toHexString())}
                        style={colorPickerStyle}
                    />
                    <Button onClick={generateCSV}>
                        CSV
                    </Button>
                    <Form ref={formRef} onFinish={handleSubmit}>
                        <Form.Item name="name" label="Neuer Käufername">
                            <Input style={{ backgroundColor: 'black', color: 'white' }} />
                        </Form.Item>
                        <Form.Item name="existingName" label="Vorhandener Käufer">
                            <Select placeholder="Einen vorhandenen Käufer auswählen" allowClear>
                                {namesList.map((name, index) => (
                                    <Select.Option key={index} value={name}>
                                        {name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item label="Zeit/Datum">
                            <DatePicker showTime value={datetime} onChange={setDatetime} />
                        </Form.Item>
                        <Form.Item label="Anzahl der Liter">
                            <InputNumber value={liters} onChange={setLiters} />
                        </Form.Item>
                        <Form.Item label="Kaufpreis">
                            <InputNumber value={price} onChange={setPrice} />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Eintragen
                            </Button>
                        </Form.Item>
                    </Form>
                    <DataTable />
                </Content>
            </Layout>
        </ConfigProvider>
    );
};

export default MilkPurchaseForm;

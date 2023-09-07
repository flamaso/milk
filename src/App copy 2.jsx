import React, { useState, useEffect, useRef } from 'react';
import { theme,Space, ConfigProvider, Form, Input, Button, DatePicker, InputNumber, Switch, Select, Table, Layout, Menu, ColorPicker, Divider, Popconfirm } from 'antd';
import moment from 'moment';

const { Header, Content } = Layout;

const MilkPurchaseForm = () => {
    const [namesList, setNamesList] = useState([]);
    const [datetime, setDatetime] = useState(moment());
    const [liters, setLiters] = useState(0);
    const [price, setPrice] = useState(0);
    const [showDetails, setShowDetails] = useState(false);
    const [primary, setPrimary] = useState('#1677ff');
    const formRef = useRef(null);
    const [editingKey, setEditingKey] = useState('');
    const [dataSource, setDataSource] = useState([]);

    useEffect(() => {
        const storedNames = JSON.parse(localStorage.getItem('namesList') || '[]');
        setNamesList(storedNames);
    }, []);

    useEffect(() => {
        const storedData = JSON.parse(localStorage.getItem('milkPurchases') || '[]');
        setDataSource(storedData.map(item => ({ ...item, key: generateKey() })));
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
        setDataSource([...dataSource, { ...data, key: generateKey() }]);
    };

    const generateKey = () => {
        return Math.random().toString(36).substr(2, 9);
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

    const deleteRow = (key) => {
        const newData = dataSource.filter(item => item.key !== key);
        localStorage.setItem('milkPurchases', JSON.stringify(newData));
        setDataSource(newData);
    };

    const edit = (record) => {
        formRef.current.setFieldsValue({
            name: '',
            existingName: '',
            datetime: moment(),
            liters: 0,
            price: 0,
            ...record,
        });
        setEditingKey(record.key);
    };

    const cancel = () => {
        setEditingKey('');
    };

    const save = async (key) => {
        try {
            const row = await formRef.current.validateFields();
            const newData = [...dataSource];
            const index = newData.findIndex(item => key === item.key);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, { ...item, ...row });
                setDataSource(newData);
                localStorage.setItem('milkPurchases', JSON.stringify(newData));
                setEditingKey('');
            } else {
                console.log('Eintrag nicht gefunden');
            }
        } catch (err) {
            console.log('Fehler beim Speichern', err);
        }
    };

    const isEditing = (record) => record.key === editingKey;

    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Datetime', dataIndex: 'datetime', key: 'datetime' },
        { title: 'Liters', dataIndex: 'liters', key: 'liters' },
        { title: 'Price', dataIndex: 'price', key: 'price' },
        {
            title: 'Aktionen',
            dataIndex: 'actions',
            key: 'actions',
            render: (_, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <Space>
                        <a onClick={() => save(record.key)}>Speichern</a>
                        <a onClick={cancel}>Abbrechen</a>
                    </Space>
                ) : (
                    <Space>
                        <a onClick={() => edit(record)}>Bearbeiten</a>
                        <Popconfirm title="Sicher, dass du löschen möchtest?" onConfirm={() => deleteRow(record.key)}>
                            <a>Löschen</a>
                        </Popconfirm>
                    </Space>
                );
            },
        },
    ];

    const navColorStyle = (index) => {
        const brightness = 100 - (index * 5);
        return { backgroundColor: primary, filter: `brightness(${brightness}%)` };
    };

    const formInputStyle = {
        backgroundColor: 'black',
        color: 'white'
    };

    const colorPickerStyle = {
        backgroundColor: 'black'
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
            <Layout style={{ minHeight: '100vh' }}>
                <Header>
                    <Menu
                        theme="dark"
                        mode="horizontal"
                        defaultSelectedKeys={['2']}
                        style={{ backgroundColor: primary }}
                    >
                        {new Array(15).fill(null).map((_, index) => {
                            const key = index + 1;
                            return (
                                <Menu.Item key={key} style={navColorStyle(index)}>
                                    {`nav ${key}`}
                                </Menu.Item>
                            );
                        })}
                    </Menu>
                </Header>
                <Content style={{ background: 'black', color: 'gray', marginLeft: '5%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5%' }}>
                    <ColorPicker 
                        showText 
                        value={primary} 
                        onChangeComplete={(color) => setPrimary(color.toHexString())} 
                        style={colorPickerStyle}
                    />
                    <Space>
                        <Button onClick={generateCSV}>
                            CSV
                        </Button>
                        <Switch checked={showDetails} onChange={setShowDetails} />
                    </Space>
                    <Form ref={formRef} onFinish={handleSubmit}>
                        <Form.Item name="name" label="Neuer Käufername">
                            <Input style={formInputStyle} />
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
                        <Form.Item type="default" label="Zeit/Datum">
                            <DatePicker showTime value={datetime} onChange={setDatetime} />
                        </Form.Item>
                        <Form.Item type="primary" label="Anzahl der Liter">
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
                    {showDetails && (
                        <Table 
                            dataSource={dataSource} 
                            columns={columns} 
                            pagination={false}
                            components={{
                                body: {
                                    cell: EditableCell,
                                },
                            }}
                        />
                    )}
                </Content>
            </Layout>
        </ConfigProvider>
    );
};

const EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
}) => {
    const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
    return (
        <td {...restProps}>
            {editing ? (
                <Form.Item
                    name={dataIndex}
                    style={{
                        margin: 0,
                    }}
                    rules={[
                        {
                            required: true,
                            message: `Bitte ${title} eingeben!`,
                        },
                    ]}
                >
                    {inputNode}
                </Form.Item>
            ) : (
                children
            )}
        </td>
    );
};

export default MilkPurchaseForm;

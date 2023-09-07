import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ConfigProvider, Form, Input, Button, Layout, Menu } from 'antd';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { SettingOutlined } from '@ant-design/icons';
import { MailOutlined } from '@ant-design/icons';
import { PlusOutlined, ContainerOutlined, ToolOutlined } from '@ant-design/icons';
import axios from 'axios';
import PropTypes from 'prop-types'; // Neu importiert
import Shuffle from 'shufflejs';


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
const MainMenu = ({ setSelectedMenu, setSearchResults, setIsSearchActive }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [focus, setFocus] = useState(false); // Zustand für den Fokus auf das Suchfeld

    const handleSearch = async () => {
        try {
            setIsSearchActive(true);
            const response = await axios.get(`http://127.0.0.1:8000/search/?query=${searchQuery}`);
            setSearchResults(response.data);
        } catch (error) {
            console.error("Fehler bei der Suche:", error);
        }
    };

    return (
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['3']}
            onSelect={({ key }) => {
                setSelectedMenu(key);
                setFocus(false);  // Fokus entfernen, wenn ein Menüelement ausgewählt wird
                setIsSearchActive(false); // Suche deaktivieren
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
                    placeholder="Suchen..."
                    value={searchQuery}
                    onSearch={() => handleSearch()}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => {
                        setFocus(true); // Fokus setzen
                        setIsSearchActive(true); // Aktivieren der Suche
                    }}
                    onBlur={() => setFocus(false)} // Fokus entfernen
                    style={{ verticalAlign: 'middle' }}
                />
            </Menu.Item>
        </Menu>
    );
};

const SearchResultsTable = ({ rowData }) => {
    const shuffleContainerRef = useRef();

    useEffect(() => {
        console.log("SearchResultsTable useEffect: rowData:", rowData);
        if (shuffleContainerRef.current) {
            const shuffleInstance = new Shuffle(shuffleContainerRef.current, {
                itemSelector: '.picture-item',
            });
            shuffleInstance.sort({ randomize: true });
        }
    }, [rowData]);

    return (
        <div ref={shuffleContainerRef} className="my-shuffle-container" style={{ color: 'white' }}>
            {rowData.map((result, index) => (
                <div className="picture-item" key={index} style={{ border: '1px solid white' }}>
                    <div>Verkauft am: {result.datum}</div>
                    <div>Titel: {result.titel}</div>
                    <div>Zustand: {result.zustand}</div>
                    <div>Preis: {result.preis}</div>
                    <div>eBay Nr: {result.ebay_nr}</div>
                </div>
            ))}
        </div>
    );
};

SearchResultsTable.propTypes = {
    rowData: PropTypes.array.isRequired,
};
DataTable.propTypes = {
    rowData: PropTypes.array.isRequired,
    updateRowData: PropTypes.func.isRequired,
};

ItemForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
};

MainMenu.propTypes = {
    setSelectedMenu: PropTypes.func.isRequired,
    setSearchResults: PropTypes.func.isRequired,
    setIsSearchActive: PropTypes.func.isRequired,
};

SearchResultsTable.propTypes = {
    rowData: PropTypes.array.isRequired,
};

const App = () => {
    const [rowData, setRowData] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedMenu, setSelectedMenu] = useState('3');
    const [isSearchActive, setIsSearchActive] = useState(false);

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

    let content;

    if (isSearchActive && searchResults.length > 0) { // Überprüfung, ob Suchergebnisse vorhanden sind
        content = <SearchResultsTable rowData={searchResults} />;
    } else if (selectedMenu === '2') {
        content = <ItemForm onSubmit={addItem} />;
    } else if (selectedMenu === '3') {
        content = <DataTable rowData={rowData} updateRowData={updateItem} />;
    }

    return (
        <ConfigProvider>
            <Layout style={{ minHeight: '100vh', backgroundColor: 'black' }}>
                <MainMenu setSelectedMenu={setSelectedMenu} setSearchResults={setSearchResults} setIsSearchActive={setIsSearchActive} />
                <Content style={{
                    background: 'black',
                    color: 'gray',
                    marginLeft: '0%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '5%'
                }}>
                    {content}
                </Content>
            </Layout>
        </ConfigProvider>
    );
};

export default App;
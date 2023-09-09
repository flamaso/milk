import React, { useState, useEffect, useMemo } from 'react';
import { ConfigProvider, Form, Input, Button, Layout, Menu } from 'antd';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { SettingOutlined, MailOutlined, PlusOutlined, ContainerOutlined, HomeOutlined } from '@ant-design/icons';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Icon } from '@iconify/react';
import homeExport from '@iconify/icons-mdi/home-export-outline';
import homeImport from '@iconify/icons-mdi/home-import-outline';


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
const MainMenu = ({ setSelectedMenu, setSearchResults, setIsSearchActive, setCategories }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [focus, setFocus] = useState(false); // Zustand für den Fokus auf das Suchfeld

    const handleSearch = async () => {
        try {
            setIsSearchActive(true);
            const response = await axios.get(`http://127.0.0.1:8000/search/?query=${searchQuery}`);
            setSearchResults(response.data.items || []);
            setCategories(response.data.categories || []); // Kategorien setzen
        } catch (error) {
            console.error("Fehler bei der Suche:", error);
        }
    };

    return (
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['3']}
            onSelect={({ key }) => {
                setSelectedMenu(key);
                setIsSearchActive(false);
            }}
        >

            <Menu.Item key="1"><HomeOutlined /></Menu.Item> {/* Icon für "Start" */}
            <Menu.Item key="2"><PlusOutlined /></Menu.Item>

            <Menu.Item key="3"><ContainerOutlined /></Menu.Item>
            <Menu.Item key="4"><Icon icon={homeExport} /></Menu.Item> {/* Neuer Menüpunkt */}
            <Menu.Item key="5"><MailOutlined /></Menu.Item>


            <Menu.Item key="6"><SettingOutlined /></Menu.Item>
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

const SearchResults = ({ rowData, categories }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div style={{ marginRight: '20px' }}>
                <h2>Kategorien</h2>
                <ul>
                    {categories.map((category, index) => (
                        <li key={index}>
                            {category.Kategorie}
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h2>Suchergebnisse</h2>
                <ul className="grid layout inner">
                    {rowData.map((result, index) => (
                        <li key={index} className="grid-tile item">
                            <div style={{ backgroundImage: `url(${result.foto})`, backgroundSize: 'contain' }} className="item-img"></div>
                            <div className="item-pnl" style={{ paddingTop: '10px', textAlign: 'center' }}>
                                <span className="pnl-label">{result.titel}</span>
                                <span className="pnl-price">{result.preis}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
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



const App = () => {
    const [rowData, setRowData] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedMenu, setSelectedMenu] = useState('3');
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [categories, setCategories] = useState([]); // Zustand für Kategorien

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
        content = <SearchResults rowData={searchResults} categories={categories} />;
    } else if (selectedMenu === '2') {
        content = <ItemForm onSubmit={addItem} />;
    } else if (selectedMenu === '3') {
        content = <DataTable rowData={rowData} updateRowData={updateItem} />;
    }

    return (
        <ConfigProvider>
            <Layout style={{ minHeight: '100vh', backgroundColor: 'black' }}>
                <MainMenu setSelectedMenu={setSelectedMenu} setSearchResults={setSearchResults} setIsSearchActive={setIsSearchActive} setCategories={setCategories} />
                <Content style={{
                    background: 'white',
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
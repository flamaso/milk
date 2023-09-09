import { ConfigProvider, Form, Input, Button, Layout, Menu, Modal } from 'antd';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { SettingOutlined, MailOutlined, PlusOutlined, ContainerOutlined, HomeOutlined } from '@ant-design/icons';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Icon } from '@iconify/react';
import homeExport from '@iconify/icons-mdi/home-export-outline';
//import homeImport from '@iconify/icons-mdi/home-import-outline';
import { useState, useEffect, useMemo, useCallback } from 'react';  // React entfernt


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
    const [username, setUsername] = useState(localStorage.getItem('username') || '');
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        if (!username) {
            setIsModalVisible(true);
        }
    }, [username]);
    const handleOk = () => {
        const newUser = form.getFieldValue('username');
        if (newUser) {
            setUsername(newUser);  // Zustand aktualisieren
            localStorage.setItem('username', newUser);
        }
        setIsModalVisible(false);
    };



    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const compliments = [
        `Schön, dass es dich gibt, ${username}!`,
        `Hey ${username}, cool, dass du wieder so fleißig bist!`,
        `Du machst das großartig, ${username}!`,
        `${username}, du bist ein Star!`,
        `Weiter so, ${username}! Du bist auf dem richtigen Weg!`
    ];

    const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];

    const handleSubmit = () => {
        form.validateFields()
            .then(values => {
                form.resetFields();
                onSubmit(values);
            });
    };

    return (
        <>
            <Modal title="Username" open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                <Form form={form}>
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Bitte geben Sie einen Benutzernamen ein!' }]}
                    >
                        <Input placeholder="Nenne deinen bezauberten Namen" />
                    </Form.Item>
                </Form>
            </Modal>
            <Form form={form}>
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
                <div style={{ marginTop: '20px' }}>
                    <span>{randomCompliment}</span>
                </div>
            </Form>
        </>
    );
};



const MainMenu = ({ setSelectedMenu, setSearchQuery }) => {
    const [localSearchQuery, setLocalSearchQuery] = useState('');

    const handleSearch = useCallback((query) => {  // useCallback hinzugefügt
        setSearchQuery(query);
    }, [setSearchQuery]);

    return (
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['3']}
            onSelect={({ key }) => {
                setSelectedMenu(key);
            }}
            style={{ justifyContent: 'center' }}  // Menü mittig ausrichten
        >
            <Menu.Item key="1"><PlusOutlined /></Menu.Item>  {/* Add */}
            <Menu.Item key="2"><ContainerOutlined /></Menu.Item>  {/* Products */}
            <Menu.Item key="3"><HomeOutlined /></Menu.Item>  {/* Home */}
            <Menu.Item key="4">
                <Icon icon={homeExport} style={{ fontSize: '1.3em', marginBottom: '-4px' }} />  {/* Icon tiefer setzen */}
            </Menu.Item>            <Menu.Item key="5"><MailOutlined /></Menu.Item>  {/* Mail */}
            <Menu.Item key="6"><SettingOutlined /></Menu.Item>  {/* Settings */}
            <Menu.Item key="search">
                <Input.Search
                    placeholder="Suchen..."
                    value={localSearchQuery}
                    onSearch={handleSearch}
                    onChange={e => setLocalSearchQuery(e.target.value)}
                    style={{ verticalAlign: 'middle' }}
                />
            </Menu.Item>
        </Menu>
    );
};
const SearchResults = ({ searchQuery }) => {
    const [searchResults, setSearchResults] = useState([]);
    const [categories, setCategories] = useState([]);  // Hinzufügen dieser Zeile

    useEffect(() => {
        const storedSearchResults = JSON.parse(localStorage.getItem('searchResults') || '[]');
        setSearchResults(storedSearchResults);
    }, []);

    useEffect(() => {
        localStorage.setItem('searchResults', JSON.stringify(searchResults));
    }, [searchResults]);

    const handleSearch = useCallback(async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/search/?query=${searchQuery}`);
            setSearchResults(response.data.items || []);
            setCategories(response.data.categories || []);  // Hinzufügen dieser Zeile
        } catch (error) {
            console.error("Fehler bei der Suche:", error);
        }
    }, [searchQuery]);

    useEffect(() => {
        if (searchQuery) {
            handleSearch();
        }
    }, [searchQuery, handleSearch]);

    return (<div style={{ display: 'flex', flexDirection: 'row' }}>
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
                {searchResults.map((result, index) => (
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

SearchResults.propTypes = {
    searchQuery: PropTypes.string.isRequired,  // Hinzugefügt
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
    setSearchQuery: PropTypes.func.isRequired,  // Hinzugefügt
};

SearchResults.propTypes = {
    searchQuery: PropTypes.string.isRequired,  // Hinzugefügt
};



// Haupt-App-Komponente
const App = () => {
    const [rowData, setRowData] = useState([]);
    const [selectedMenu, setSelectedMenu] = useState('3');
    const [searchQuery, setSearchQuery] = useState('');

    // Laden des gespeicherten Suchbegriffs aus dem localStorage
    useEffect(() => {
        const storedSearchQuery = localStorage.getItem('searchQuery') || '';
        setSearchQuery(storedSearchQuery);
    }, []);

    // Speichern des aktuellen Suchbegriffs im localStorage
    useEffect(() => {
        localStorage.setItem('searchQuery', searchQuery);
    }, [searchQuery]);

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

    if (selectedMenu === '1') {
        content = <ItemForm onSubmit={addItem} />;
    } else if (selectedMenu === '2') {
        content = <DataTable rowData={rowData} updateRowData={updateItem} />;
    } else {
        content = <SearchResults searchQuery={searchQuery} />;
    }

    return (
        <ConfigProvider>
            <Layout style={{ minHeight: '100vh', backgroundColor: 'black' }}>
                <MainMenu setSelectedMenu={setSelectedMenu} setSearchQuery={setSearchQuery} />
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

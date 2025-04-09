import {BrowserRouter as Router, Navigate, Route, Routes, useNavigate,} from "react-router-dom";
import React, {JSX, lazy, LazyExoticComponent, Suspense, useEffect} from "react";
import axios from "axios";
import Layout from "./components/Layout";

const AuthChecker = (): null => {
    const navigate = useNavigate();

    useEffect(() => {
        axios.defaults.withCredentials = true;
        axios.defaults.headers.common["x-api-key"] =
            "3E92EBEDCACD11D8BAD83E13-realestate-api";

        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
        } else {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            // navigate("/dashboard");
        }
    }, [navigate]); // `navigate` is stable, no unnecessary re-renders

    return null;
};

export type ComponentType = React.FC<{}> | (() => JSX.Element);
const loadPage = (path: string, hasProps: boolean = false): LazyExoticComponent<ComponentType> =>
    lazy(() => import(`${path}`).then(module => ({default: hasProps ? module.default : (props: any) => module.default(props)})));

const Dashboard = loadPage("./pages/Dashboard");
const TemplatesPage = loadPage("./pages/TemplatesPage");
const SettingsOrganizationsPage = loadPage("./pages/SettingsOrganizationsPage");
const AgreementsPage = loadPage("./pages/AgreementsPage");
const LoginPage = loadPage("./pages/Login/LoginPage");
const SignUpPage = loadPage("./pages/SignUpPage");
const NewDocumentPage = loadPage("./pages/NewDocumentPage");
const AddDocumentsPage = loadPage("./pages/AddDocumentsPage");
const DocumentUploadPage = loadPage("./pages/DocumentUploadPage");
const ReadyDocumentPage = loadPage("./pages/ReadyDocumentPage");
const CreateUser = loadPage("./pages/User/Add");
const ListUser = loadPage("./pages/User/List");
const Error404Page = loadPage("./pages/Error");

const App = () => {
    return (
        <Suspense>
            <Router>
                <AuthChecker/>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace/>}/>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/signup" element={<SignUpPage/>}/>

                    {/* user */}
                    <Route path="/user/add" element={<CreateUser/>}/>
                    <Route path="/user/list" element={<ListUser/>}/>
                    <Route path="/404" element={<Error404Page/>}/>
                    <Route path="/*" element={<Navigate to={'/404'}/>}/>
                            <Route path="/dashboard" element={<Dashboard/>}/>
                            <Route path="/templates" element={<TemplatesPage/>}/>
                            <Route path="/agreements" element={<AgreementsPage/>}/>
                            <Route
                                path="/settings/new-organization"
                                element={<SettingsOrganizationsPage/>}
                            />
                            <Route path="/new-document" element={<NewDocumentPage/>}/>
                            <Route path="/add-documents" element={<AddDocumentsPage/>}/>
                            <Route path="/document-upload" element={<DocumentUploadPage/>}/>
                            <Route path="/ready-document" element={<ReadyDocumentPage/>}/>
                </Routes>
            </Router>
        </Suspense>

    );
};

export default App;

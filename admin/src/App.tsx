import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { lazy, LazyExoticComponent, Suspense, useEffect } from "react";
import axios from "axios";

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

const Dashboard: LazyExoticComponent<() => React.JSX.Element> = lazy(
  () => import("./pages/Dashboard")
);
const TemplatesPage: LazyExoticComponent<() => React.JSX.Element> = lazy(
  () => import("./pages/TemplatesPage")
);
const SettingsOrganizationsPage: LazyExoticComponent<() => React.JSX.Element> =
  lazy(() => import("./pages/SettingsOrganizationsPage"));

const AgreementsPage: LazyExoticComponent<() => React.JSX.Element> = lazy(
  () => import("./pages/AgreementsPage")
);
const LoginPage: LazyExoticComponent<() => React.JSX.Element> = lazy(
  () => import("./pages/Login/LoginPage")
);
const SignUpPage: LazyExoticComponent<() => React.JSX.Element> = lazy(
  () => import("./pages/SignUpPage")
);
const NewDocumentPage: LazyExoticComponent<() => React.JSX.Element> = lazy(
  () => import("./pages/NewDocumentPage")
);
const AddDocumentsPage: LazyExoticComponent<() => React.JSX.Element> = lazy(
  () => import("./pages/AddDocumentsPage")
);
const DocumentUploadPage: LazyExoticComponent<() => React.JSX.Element> = lazy(
  () => import("./pages/DocumentUploadPage")
);
const ReadyDocumentPage: LazyExoticComponent<() => React.JSX.Element> = lazy(
  () => import("./pages/ReadyDocumentPage")
);

const CreateUser: LazyExoticComponent<() => React.JSX.Element> = lazy(
  () => import("./pages/User/Add")
);

const ListUser: LazyExoticComponent<() => React.JSX.Element> = lazy(
  () => import("./pages/User/List")
);

const App = () => {
  return (
    <Suspense>
      <Router>
        <AuthChecker />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* user */}
          <Route path="/user/add" element={<CreateUser />} />
          <Route path="/user/list" element={<ListUser />} />


          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/agreements" element={<AgreementsPage />} />
          {/* Settings routes */}
          {/* <Route path="/settings" element={<SettingsPage />} /> */}
          {/* Updated routes for organizations */}
          {/* Organization list (previously NewOrganizationPage) */}
          <Route
            path="/settings/new-organization"
            element={<SettingsOrganizationsPage />}
          />{" "}
          {/* New organization creation */}
          {/* Add routes for other pages as needed */}
          {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
          <Route path="/new-document" element={<NewDocumentPage />} />
          <Route path="/add-documents" element={<AddDocumentsPage />} />
          <Route path="/document-upload" element={<DocumentUploadPage />} />
          <Route path="/ready-document" element={<ReadyDocumentPage />} />
        </Routes>
      </Router>
    </Suspense>
  );
};

export default App;

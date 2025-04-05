import React, { useState, useEffect, useRef  } from 'react';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CInputGroupText,
  CRow,
  CListGroup,
  CListGroupItem,
  CImage,
} from '@coreui/react'
import { DocsComponents, DocsExample } from 'src/components'
import { apiUrl } from "../../../components/Config/Config";
import axios from 'axios';
import "leaflet/dist/leaflet.css";

const Create = () => {
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [propertyTypes, setPropertyTypes] = useState([]);
    const [propertyCategories, setPropertyCategories] = useState([]);
    const [propertyFeatures, setPropertyFeatures] = useState([]);
    const [propertyAmenities, setPropertyAmenities] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [documents, setDocuments] = useState([{ type: '', file: '', description: '' }]);
    const [latitude, setLatitude] = useState(51.505);
    const [longitude, setLongitude] = useState(-0.09);
    const [floorPlans, setFloorPlans] = useState([{
        number: '',
        rooms: '',
        bedrooms: '',
        bathrooms: '',
        price: '',
        sizePrefix: '',
        size: '',
        image: '',
        video: ''
    }]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        property_type_id: '',
        category_id: '',
        status: '',
        is_for: '',
        price: '',
        address: '',
        country_id: '',
        state_id: '',
        city_id: '',
        neighborhood: '',
        is_sale: '',
        sale_price: '',
        area_size: '',
        area_size_prefix: '',
        land_size: '',
        land_size_prefix: '',
        bedrooms: '',
        bathrooms: '',
        garage: '',
        garage_size: '',
        built_year: '',
        property_amenities:[],
        property_features:[],
        feature_image: null, // For single image file
        properties_images: [], // For multiple images
        properties_videos: [], // For video file
        property_promotion:'',
        property_document:[],
        property_floors:[],
    });
    // Reference for the file input
    const fileInputRef = useRef(null);
    // Handle button click to trigger the file input
    const handleChooseFileClick = () => {
        fileInputRef.current.click();
    };

  const fetchCountries = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/countries?per_page=all&page=1`);
      console.log(response.data.data);
      const countryList = response.data.data.map((country) => ({
        name: country.country_name,
        id: country.id,
      }));
      setCountries(countryList);
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const fetchPropertyTypes = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/property/type/get?per_page=all&page=1`);
      console.log(response.data.data);
      const propertyTypesList = response.data.data.map((propertyType) => ({
        name: propertyType.type_name,
        id: propertyType.id,
      }));
      setPropertyTypes(propertyTypesList);
    } catch (error) {
      console.error('Error fetching Property Types:', error);
    }
  };

  const fetchPropertyCategories = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/property/category/get?per_page=all&page=1`);
      console.log(response.data.data);
      const propertyCategoriesList = response.data.data.map((propertyCategory) => ({
        name: propertyCategory.category_name,
        id: propertyCategory.id,
      }));
      setPropertyCategories(propertyCategoriesList);
    } catch (error) {
      console.error('Error fetching Property Categories:', error);
    }
  };

  const fetchPropertyFeatures = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/property/feature/get?per_page=all&page=1`);
      console.log(response.data.data);
      const propertyFeaturesList = response.data.data.map((propertyFeature) => ({
        name: propertyFeature.feature_name,
        value: propertyFeature.feature_value,
        id: propertyFeature.id,
      }));
      setPropertyFeatures(propertyFeaturesList);
    } catch (error) {
      console.error('Error fetching Property Features:', error);
    }
  };

  const fetchPropertyAmenities = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/property/amenity/get?per_page=all&page=1`);
      console.log(response.data.data);
      const propertyAmenitiesList = response.data.data.map((propertyAmenity) => ({
        name: propertyAmenity.amenities_name,
        value: propertyAmenity.amenities_value,
        id: propertyAmenity.id,
      }));
      setPropertyAmenities(propertyAmenitiesList);
    } catch (error) {
      console.error('Error fetching Property Amenities:', error);
    }
  };

  // Fetch data one by one in sequence
  useEffect(() => {
    const fetchDataSequentially = async () => {
      await fetchCountries();
      await fetchPropertyTypes();
      await fetchPropertyCategories();
      await fetchPropertyFeatures();
      await fetchPropertyAmenities();
    };

    fetchDataSequentially();
  }, []);

  useEffect(() => {
    const fetchStates = async () => {
      if (selectedCountry) {
        try {
          const response = await axios.get(`${apiUrl}/api/state/bycountry/${selectedCountry}`); // Replace with your states API
          setStates(response.data.data); // Assuming the response contains a list of states
        } catch (error) {
          console.error('Error fetching states:', error);
        }
      }
    };
    fetchStates();
  }, [selectedCountry]);

  // Fetch cities when a state is selected
  useEffect(() => {
    const fetchCities = async () => {
      if (selectedState) {
        try {
          const response = await axios.get(`${apiUrl}/api/city/bystate/${selectedState}`); // Replace with your cities API
          setCities(response.data.data); // Assuming the response contains a list of cities
        } catch (error) {
          console.error('Error fetching cities:', error);
        }
      }
    };
    fetchCities();
  }, [selectedState]);


  const handleCountryChange = (e) => {
    const countryId = e.target.value;
    setSelectedCountry(countryId);
    setFormData((prevData) => ({
        ...prevData,
        ["country_id"]: countryId, // Dynamically update the state using the id of the input field
      }));
    setStates([]); // Clear states when a new country is selected
    setCities([]); // Clear cities when a new country is selected
  };

  const handleStateChange = (e) => {
    const stateId = e.target.value;
    setSelectedState(stateId);
    setFormData((prevData) => ({
        ...prevData,
        ["state_id"]: stateId, // Dynamically update the state using the id of the input field
      }));
    setCities([]); // Clear cities when a new state is selected
  };

  const handleChange = (e) => {
    const { id, type, checked, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: type === 'checkbox' ? checked : value, // For checkboxes, use checked value
    }));
  };


  const handleAmenityChange = (amenityId) => {
    setFormData((prevData) => {
      // If the amenity is already selected, remove it, otherwise add it
      const property_amenities = prevData.property_amenities.includes(amenityId)
        ? prevData.property_amenities.filter((id) => id !== amenityId)
        : [...prevData.property_amenities, amenityId];
      
      return {
        ...prevData,
        property_amenities, // Update the selected amenities array
      };
    });
  };
  const handleFeatureChange = (featureId) => {
    setFormData((prevData) => {
      // If the amenity is already selected, remove it, otherwise add it
      const property_features = prevData.property_features.includes(featureId)
        ? prevData.property_features.filter((id) => id !== featureId)
        : [...prevData.property_features, featureId];
      
      return {
        ...prevData,
        property_features, // Update the selected amenities array
      };
    });
  };



  const handleFeatureImageChange = (event) => {
    const file = event.target.files[0]; // Only one file can be selected for the feature image
    setFormData((prevData) => ({
      ...prevData,
      feature_image: file,
    }));
  };
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
            <CCardHeader>
                <strong>Add</strong> <small>New Property</small>
            </CCardHeader>
            <CCardBody>
                
                <p className="text-body-secondary small">
                We are glad to see you again!
                
                </p>
                <DocsExample href="forms/layout#gutters">
                <CForm className="row g-3">
                    <CCol md={12}>
                        <CFormLabel htmlFor="title">Title</CFormLabel>
                        <CFormInput 
                            type="text" 
                            id="title"
                            placeholder="Enter Property Title"
                            value={formData.title} 
                            onChange={handleChange}
                        />
                    </CCol>
                    <CCol md={12}>
                        <CFormLabel htmlFor="description">description</CFormLabel>
                        <CFormTextarea 
                            rows={3}
                            id="description"
                            placeholder="Enter Property Description"
                            value={formData.description} // Bind to state
                            onChange={handleChange} // Update state on change
                        ></CFormTextarea>
                    </CCol>
                    <CCol xs={12}>
                        <CFormLabel htmlFor="property_type_id">Property Type</CFormLabel>
                        <CFormSelect
                            id="property_type_id" // This is the state key
                            className="add__listing--form__select"
                            value={formData.property_type_id} // Bind the selected value to formData.type
                            onChange={handleChange} // Update state on change
                            disabled={!propertyTypes.length} 
                        >
                            <option>Choose...</option>
                            {propertyTypes?.map((propertyType) => (
                                <option key={propertyType.id} value={propertyType.id}>
                                    {propertyType.name}
                                </option>
                            ))}
                        </CFormSelect>
                    </CCol>
                    <CCol xs={12}>
                        <CFormLabel htmlFor="category_id">Property Category</CFormLabel>
                        <CFormSelect
                            id="category_id" // This is the state key
                            className="add__listing--form__select"
                            value={formData.category_id} // Bind the selected value to formData.type
                            onChange={handleChange} // Update state on change
                            disabled={!propertyCategories.length}
                        >
                            <option>Choose...</option>
                            {propertyCategories?.map((propertyCategory) => (
                                <option key={propertyCategory.id} value={propertyCategory.id}>
                                    {propertyCategory.name}
                                </option>
                            ))}
                        </CFormSelect>
                    </CCol>
                    <CCol md={6}>
                        <CFormLabel htmlFor="status">Property Status</CFormLabel>
                        <CFormSelect
                            id="status" // This is the state key
                            className="add__listing--form__select"
                            value={formData.status} // Bind the selected value to formData.type
                            onChange={handleChange} // Update state on change
                        >
                            <option>Choose...</option>
                            <option value="available">Available</option>
                            <option value="sold">Sold</option>
                            <option value="rented">Rented</option>
                        </CFormSelect>
                    </CCol>
                    <CCol md={6}>
                        <CFormLabel htmlFor="is_for">Property For</CFormLabel>
                        <CFormSelect
                            id="is_for" // This is the state key
                            className="add__listing--form__select"
                            value={formData.is_for} // Bind the selected value to formData.type
                            onChange={handleChange} // Update state on change
                        >
                            <option>Choose...</option>
                            <option value="buy">Buy</option>
                            <option value="rent">Rent</option>
                        </CFormSelect>
                    </CCol>


                    <CCol md={6}>
                        <CFormLabel htmlFor="price">Price</CFormLabel>
                        <CFormInput 
                            id="price"
                            placeholder="Enter Property Price"
                            type="number"
                            value={formData.price} 
                            onChange={handleChange}
                        />
                    </CCol>

                    <CCol md={6}>
                        <CFormLabel htmlFor="property_promotion">Property Promotion</CFormLabel>
                        <CFormSelect
                            id="property_promotion" // This is the state key
                            className="add__listing--form__select"
                            value={formData.property_promotion} // Bind the selected value to formData.type
                            onChange={handleChange} // Update state on change
                        >
                            <option value="recently_added">Choose...</option>
                            <option value="recently_added">Default</option>
                            <option value="featured">Featured</option>
                            <option value="top_listing">Top Listing</option>
                            <option value="urgent">Urgent</option>
                            <option value="premium">Premium</option>
                            <option value="exclusive">Exclusive</option>
                            <option value="boosted">Boosted</option>
                            <option value="price_reduction">Price Reduction</option>
                            <option value="limited_time_offer">Limited Time Offer</option>
                            <option value="verified">Verified</option>
                            <option value="sponsored">Sponsored</option>
                        </CFormSelect>
                    </CCol>
                    
                </CForm>
            </DocsExample>
        </CCardBody>

        <CCardBody>
            
            <h3 className="text-body-secondary">Location</h3>
            <DocsExample href="forms/layout#gutters">
                <CForm className="row g-3">
                    <CCol md={12}>
                        <CFormLabel htmlFor="address">Address</CFormLabel>
                        <CFormTextarea 
                            rows={1}
                            id="address"
                            placeholder="Enter Property Address"
                            value={formData.address} // Bind to state
                            onChange={handleChange} // Update state on change
                        ></CFormTextarea>
                    </CCol>
                    <CCol xs={12}>
                        <CFormLabel htmlFor="country_id">Country</CFormLabel>
                        <CFormSelect
                            id="country_id" // This is the state key
                            className="add__listing--form__select"
                            value={formData.country_id} // Bind the selected value to formData.type
                            onChange={handleCountryChange} // Update state on change
                            disabled={!handleCountryChange.length}
                        >
                            <option>Choose...</option>
                            {countries.map((country) => (
                                <option key={country.id} value={country.id}>
                                    {country.name}
                                </option>
                            ))}
                        </CFormSelect>
                    </CCol>
                    <CCol xs={12}>
                        <CFormLabel htmlFor="state_id">State</CFormLabel>
                        <CFormSelect
                            id="state_id" // This is the state key
                            className="add__listing--form__select"
                            value={formData.state_id} // Bind the selected value to formData.type
                            onChange={handleStateChange} // Update state on change
                            disabled={!states.length}
                        >
                            <option>Choose...</option>
                            {states?.map((state) => (
                                <option key={state.id} value={state.id}>
                                    {state.state_name}
                                </option>
                            ))}
                        </CFormSelect>
                    </CCol>
                    <CCol xs={12}>
                        <CFormLabel htmlFor="city_id">City</CFormLabel>
                        <CFormSelect
                            id="city_id" // This is the state key
                            className="add__listing--form__select"
                            value={formData.city_id} // Bind the selected value to formData.type
                            onChange={handleChange} // Update state on change
                            disabled={!cities.length}
                        >
                            <option>Choose...</option>
                            {cities?.map((city) => (
                                <option key={city.id} value={city.id}>
                                    {city.city_name}
                                </option>
                            ))}
                        </CFormSelect>
                    </CCol>
                    <CCol md={12}>
                        <CFormLabel htmlFor="neighborhood">Neighborhood</CFormLabel>
                        <CFormInput 
                            type="text" 
                            id="neighborhood"
                            placeholder="Enter Property Neighborhood"
                            value={formData.neighborhood} 
                            onChange={handleChange}
                        />
                    </CCol>
                    <CCol md={12}>
                        <CFormLabel htmlFor="postal_code">Postal Code</CFormLabel>
                        <CFormInput 
                            type="text"   
                            id="postal_code"
                            placeholder="Enter Property Postal Code"
                            value={formData.postal_code} 
                            onChange={handleChange}
                        />
                    </CCol>
                    <CCol md={12}>
                        <CFormLabel htmlFor="latitude">Latitude</CFormLabel>
                        <CFormInput 
                            type="text"   
                            id="latitude"
                            placeholder="Enter Property latitude"
                            value={formData.latitude} 
                            onChange={handleChange}
                        />
                    </CCol>
                    <CCol md={12}>
                        <CFormLabel htmlFor="longitude">Longitude</CFormLabel>
                        <CFormInput 
                            type="text"   
                            id="longitude"
                            placeholder="Enter Property longitude"
                            value={formData.longitude} 
                            onChange={handleChange}
                        />
                    </CCol>
                    <CCol md={12}>
                         {/* <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d19868.373358018045!2d-0.11951900000000001!3d51.503186!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487604b900d26973%3A0x4291f3172409ea92!2slastminute.com%20London%20Eye!5e0!3m2!1sen!2sus!4v1699801088151!5m2!1sen!2sus" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe> */}
                                                    {/* <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false}>
                                                        <TileLayer
                                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                        />
                                                        <Marker position={[51.505, -0.09]}>
                                                            <Popup>
                                                            A pretty CSS3 popup. <br /> Easily customizable.
                                                            </Popup>
                                                        </Marker>
                                                    </MapContainer> */}
                    </CCol>
                </CForm>
            </DocsExample>
        </CCardBody>
        <CCardBody>
            
            <h3 className="text-body-secondary">Property Sale</h3>
            <DocsExample href="forms/layout#gutters">
                <CForm className="row g-3">
                    <CCol md={12}>
                        <CFormCheck 
                            type="checkbox" 
                            id="is_sale" 
                            label="is Sale"
                            value={formData.is_sale}
                            onChange={handleChange}
                        />
                    </CCol>
                    {formData.is_sale && (
                        <CCol md={12}>
                            <CFormLabel htmlFor="sale_price">Sale Price</CFormLabel>
                            <CFormInput 
                                type="text"   
                                id="sale_price"
                                placeholder="Enter Property Sale Price"
                                value={formData.sale_price} 
                                onChange={handleChange}
                            />
                        </CCol>
                                            
                    )}                            
                </CForm>
            </DocsExample>
        </CCardBody>
        
        <CCardBody>
            
            <h3 className="text-body-secondary">Detailed Information</h3>
            <DocsExample href="forms/layout#gutters">
                <CForm className="row g-3">
                    <CCol md={12}>
                        <CFormLabel htmlFor="area_size">Area Size</CFormLabel>
                        <CFormInput 
                            type="text"   
                            id="area_size"
                            placeholder="Enter Property Area Size"
                            value={formData.area_size} 
                            onChange={handleChange}
                        />
                    </CCol>
                    <CCol md={6}>
                        <CFormLabel htmlFor="area_size_prefix">Size Prefix</CFormLabel>
                        <CFormSelect
                            id="area_size_prefix" // This is the state key
                            className="add__listing--form__select"
                            value={formData.area_size_prefix} // Bind the selected value to formData.type
                            onChange={handleChange} // Update state on change
                        >
                            <option value="">Choose...</option>
                            <option value="sq_ft">Square Feet</option>
                            <option value="sq_m">Square Meters</option>
                            <option value="sq_yd">Square Yards</option>
                            <option value="sq_km">Square Kilometers</option>
                            <option value="sq_mi">Square Miles</option>
                        </CFormSelect>
                    </CCol>
                    <CCol md={12}>
                        <CFormLabel htmlFor="land_size">Land Size</CFormLabel>
                        <CFormInput 
                            type="text"   
                            id="land_size"
                            placeholder="Enter Property Land Size"
                            value={formData.land_size} 
                            onChange={handleChange}
                        />
                    </CCol>
                    <CCol md={6}>
                        <CFormLabel htmlFor="land_size_prefix">Land Area Size Prefix</CFormLabel>
                        <CFormSelect
                            id="land_size_prefix" // This is the state key
                            className="add__listing--form__select"
                            value={formData.land_size_prefix} // Bind the selected value to formData.type
                            onChange={handleChange} // Update state on change
                        >
                            <option value="">Choose...</option>
                            <option value="sq_ft">Square Feet</option>
                            <option value="sq_m">Square Meters</option>
                            <option value="sq_yd">Square Yards</option>
                            <option value="sq_km">Square Kilometers</option>
                            <option value="sq_mi">Square Miles</option>
                        </CFormSelect>
                    </CCol>
                    <CCol md={12}>
                        <CFormLabel htmlFor="bedrooms">Bedrooms</CFormLabel>
                        <CFormInput 
                            type="text"   
                            id="bedrooms"
                            placeholder="Enter Property Bedrooms"
                            value={formData.bedrooms} 
                            onChange={handleChange}
                        />
                    </CCol>
                    <CCol md={12}>
                        <CFormLabel htmlFor="bathrooms">Bathrooms</CFormLabel>
                        <CFormInput 
                            type="text"   
                            id="bathrooms"
                            placeholder="Enter Property Bathrooms"
                            value={formData.bathrooms} 
                            onChange={handleChange}
                        />
                    </CCol>
                    <CCol md={12}>
                        <CFormLabel htmlFor="garage">Garages</CFormLabel>
                        <CFormInput 
                            type="text"   
                            id="garage"
                            placeholder="Enter Property Garages"
                            value={formData.garage} 
                            onChange={handleChange}
                        />
                    </CCol>
                    <CCol md={12}>
                        <CFormLabel htmlFor="garage_size">Garages Size</CFormLabel>
                        <CFormInput 
                            type="text"   
                            id="garage_size"
                            placeholder="Enter Property Garages Size"
                            value={formData.garage_size} 
                            onChange={handleChange}
                        />
                    </CCol>
                    <CCol md={12}>
                        <CFormLabel htmlFor="built_year">Year Built</CFormLabel>
                        <CFormInput 
                            type="text"   
                            id="built_year"
                            placeholder="Enter Property Year Built"
                            value={formData.built_year} 
                            onChange={handleChange}
                        />
                    </CCol>
                </CForm>
            </DocsExample>
        </CCardBody>

        <CCardBody>
        <h3 className="text-body-secondary">Property Amenities</h3>
        <DocsExample href="forms/layout#gutters">
            <CForm className="row g-3">
            <CCol md={12}>
                <CListGroup>
                {propertyAmenities?.map((amenity) => (
                    <CListGroupItem key={amenity.id} className="d-flex align-items-center">
                    <CFormCheck
                        id={`check-${amenity.id}`}
                        value={amenity.id}
                        label={amenity.name}
                        checked={formData.property_amenities.includes(amenity.id)}
                        onChange={() => handleAmenityChange(amenity.id)}
                    />
                    </CListGroupItem>
                ))}
                </CListGroup>
            </CCol>
            </CForm>
        </DocsExample>
        </CCardBody>
        <CCardBody>
        <h3 className="text-body-secondary">Property Features</h3>
        <DocsExample href="forms/layout#gutters">
            <CForm className="row g-3">
            <CCol md={12}>
                <CListGroup>
                {propertyFeatures?.map((feature) => (
                    <CListGroupItem key={feature.id} className="d-flex align-items-center">
                    <CFormCheck
                        id={`check-feature-${feature.id}`}
                        value={feature.id}
                        label={feature.name}
                        checked={formData.property_features.includes(feature.id)}
                        onChange={() => handleFeatureChange(feature.id)}
                    />
                    </CListGroupItem>
                ))}
                </CListGroup>
            </CCol>
            </CForm>
        </DocsExample>
        </CCardBody>

        <CCardBody className="add__property--box mb-30">
            <h3 className="add__property--box__title mb-20">Property Feature Image</h3>
            <CRow className="property__media--wrapper d-flex justify-content-between">
                <CCol>
                <div className="browse__file--area position-relative">
                    <CButton component="label" className="browse__file--btn" onClick={handleChooseFileClick}>
                    Choose File
                    <input
                        ref={fileInputRef}
                        className="browse__file--input__field"
                        type="file"
                        onChange={handleFeatureImageChange}
                        style={{ display: 'none' }} // Hide the input, making the button trigger the file selection
                    />
                    </CButton>
                </div>
                </CCol>
            </CRow>
            {formData.feature_image && (
                <CRow className="mt-3">
                <CCol>
                    <CImage
                    src={URL.createObjectURL(formData.feature_image)}
                    alt="Feature Preview"
                    width="100"
                    height="100"
                    />
                </CCol>
                <CCol className="d-flex align-items-center">
                    <CButton
                    type="button"
                    color="danger"
                    onClick={() => setFormData({ ...formData, feature_image: null })}
                    >
                    Remove
                    </CButton>
                </CCol>
                </CRow>
            )}
            </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Create

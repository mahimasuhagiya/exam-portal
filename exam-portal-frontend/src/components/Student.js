import axios from "axios";
import React, { useEffect, useState } from "react";
import API_URL, { getWithExpiry } from "../services/authService";
import { toast, ToastContainer } from "react-toastify";
import { DataGrid } from "@mui/x-data-grid";
import { Modal } from "reactstrap";
import showToastConfirmation from "./toast";
import "../css/styles.css";
import Papa from "papaparse";
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCsv, faFileExcel, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

const Student = () => {
    const [studentsData, setStudentsData] = useState([]);
    const [collegesData, setCollegesData] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [newStudent, setNewStudent] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        college: { id: "", name: "" },
        role: "STUDENT",
        isActive: true,
    });
    const [errors, setErrors] = useState({});
    const token = getWithExpiry("jwtToken");

    // Fetch students data
    const fetchStudents = async () => {
        if (!token) return;
        try {
            const response = await axios.get(`${API_URL}/users/role/student`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            setStudentsData(response.data);
        } catch (error) {
            toast.error("Error fetching students data!");
        }
    };

    const fetchColleges = async () => {
        try {
            const response = await axios.get(`${API_URL}/colleges`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            setCollegesData(response.data);
        } catch (error) {
            toast.error("Error fetching colleges data!");
        }
    };

    useEffect(() => {
        fetchStudents();
        fetchColleges();
    }, [token]);

    // Toggle modal and reset form if it's not open
    const toggleModal = (flag) => {
        fetchColleges();
        setIsModalOpen(!isModalOpen);
        if (flag) {
            setNewStudent({
                name: "",
                email: "",
                password: "",
                phone: "",
                address: "",
                college: { id: "", name: "" },
                role: "STUDENT",
                isActive: true,
            }); // Reset form
            setIsEditing(false); // Reset editing mode when opening the modal
            setErrors({}); // Reset errors
        }
    };

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "college") {
            setNewStudent((prev) => ({ ...prev, college: { id: value, name: collegesData.filter((clg) => clg.id === value)[0].name } }));
        } else {
            setNewStudent((prev) => ({ ...prev, [name]: value }));
        }
        // Clear the error for the field when it changes
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    // Validate form fields
    const validateForm = () => {
        const newErrors = {};
        if (!newStudent.name) newErrors.name = "Name is required";
        if (!newStudent.email) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(newStudent.email)) {
            newErrors.email = "Email address is invalid";
        }
        if (!isEditing && !newStudent.password) newErrors.password = "Password is required";
        if (!newStudent.phone) newErrors.phone = "Phone is required";
        if (!newStudent.address) newErrors.address = "Address is required";
        if (!newStudent.college.id) newErrors.college = "College is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Save student (Add/Edit)
    const saveStudent = async () => {
        if (!validateForm()) return;

        const saveCallback = async () => {
            try {
                if (isEditing) {
                    const response = await axios.put(`${API_URL}/users`, newStudent, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    });
                    setStudentsData((prev) =>
                        prev.map((student) =>
                            student.id === selectedStudent.id ? response.data : student
                        )
                    );
                    toast.success("Student updated successfully!");
                } else {
                    const response = await axios.post(`${API_URL}/users`, newStudent, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    });
                    setStudentsData([...studentsData, response.data]);
                    toast.success("Student added successfully!");
                }

                toggleModal();
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred.";
                toast.error(errorMessage);
            }
        };

        showToastConfirmation(isEditing ? "update" : "add", "Student", saveCallback);
    };

    // Toggle student active status
    const toggleStudentStatus = (id) => {
        const student = studentsData.find((s) => s.id === id);
        const action = student.active ? "deactivate" : "activate";
        const toggleCallback = async () => {
            try {
                const response = await axios.put(
                    `${API_URL}/users/status/${id}`,
                    { isActive: !student.active },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                setStudentsData((prev) =>
                    prev.map((s) => (s.id === id ? { ...s, active: response.data.active } : s))
                );
                toast.success(`Student ${response.data.active ? "activated" : "deactivated"} successfully!`);
            } catch (error) {
                toast.error("Error while changing student status. Please try again.");
            }
        };

        showToastConfirmation(
            action,
            `student "${student.name}"`,
            toggleCallback
        );
    };

    const deleteStudent = (id) => {
        const deleteCallback = async () => {
            try {
                await axios.delete(`${API_URL}/users/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                setStudentsData((prev) => prev.filter((student) => student.id !== id));
                toast.success("Student deleted successfully!");
            } catch (error) {
                toast.error("Error deleting student. Please try again.");
            }
        };

        showToastConfirmation("delete", "student.", deleteCallback, "All results of the student will also get deleted");
    };

    // Open Edit Form
    const openEditForm = (student) => {
        setSelectedStudent(student);
        setIsEditing(true); // Set editing mode
        setNewStudent({
            id: student.id,
            name: student.name,
            email: student.email,
            password: student.password,
            phone: student.phone,
            address: student.address,
            college: student.college,
            role: "STUDENT",
            active: student.active,
        });
        toggleModal(); // Open the modal
    };

    // Filter data based on search
    const filteredData = studentsData.filter((student) =>
        student.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        student.college?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        student.phone?.toString().includes(searchText) ||
        student.address?.toLowerCase().includes(searchText.toLowerCase())
    ).sort((a, b) => b.id - a.id);

    const exportToCSV = () => {
        try {
            if (studentsData.length === 0) {
                toast.warn("No data available to export.");
                return;
            }
            const csvData = studentsData.map(student => ({
                ID: student.id,
                Name: student.name,
                Email: student.email,
                Phone: student.phone,
                Address: student.address,
                College: student.college?.name || "N/A",
                Status: student.active ? "Active" : "Inactive",
            }));

            const csv = Papa.unparse(csvData);
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.setAttribute("download", "students_data.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("CSV file downloaded successfully!");
        } catch (error) {
            toast.error("Error exporting CSV!");
        }
    };

    // Add this state near other state declarations
    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
    const toggleExportDropdown = () => setExportDropdownOpen(prev => !prev);

    // Add these export functions
    const exportToExcel = () => {
        try {
            const worksheet = XLSX.utils.json_to_sheet(studentsData.map(student => ({
                ID: student.id,
                Name: student.name,
                Email: student.email,
                Phone: student.phone,
                Address: student.address,
                College: student.college?.name || "N/A",
                Status: student.active ? "Active" : "Inactive"
            })));

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
            XLSX.writeFile(workbook, "students.xlsx");
            toast.success("Excel file downloaded successfully!");
        } catch (error) {
            toast.error("Error exporting Excel file!");
        }
    };

    const exportToPDF = () => {
        try {
            const doc = new jsPDF();
            doc.text("Student List", 20, 20);

            let yPos = 30;
            studentsData.forEach(student => {
                doc.text(`ID: ${student.id}`, 20, yPos);
                doc.text(`Name: ${student.name}`, 20, yPos + 10);
                doc.text(`Email: ${student.email}`, 20, yPos + 20);
                doc.text(`Phone: ${student.phone}`, 20, yPos + 30);
                doc.text(`College: ${student.college?.name || "N/A"}`, 20, yPos + 40);
                doc.text(`Status: ${student.active ? "Active" : "Inactive"}`, 20, yPos + 50);
                yPos += 60;

                if (yPos > 280) {
                    doc.addPage();
                    yPos = 20;
                }
            });

            doc.save("students.pdf");
            toast.success("PDF file downloaded successfully!");
        } catch (error) {
            toast.error("Error exporting PDF!");
        }
    };

    // Columns for DataGrid
    const columns = [
        { field: "id", headerName: "ID", width: 100 },
        { field: "name", headerName: "Name", flex: 1 },
        {
            field: "college.name", headerName: "College", flex: 1, renderCell: (params) => (
                <div>
                    {params.row.college.name || "N/A"}
                </div>
            ),
        },
        {
            field: "contactInfo",
            headerName: "Contact Info",
            flex: 2,
            renderCell: (params) => (
                <div style={{ whiteSpace: "normal", lineHeight: "1.5" }}>
                    <div><strong>Email:</strong> {params.row.email || "N/A"} </div>
                    <div><strong>Phone:</strong> {params.row.phone || "N/A"}</div>
                </div>
            ),
        },
        { field: "address", headerName: "Address", flex: 1 },
        {
            field: "isActive",
            headerName: "Status",
            flex: 1,
            renderCell: (params) => (
                <button
                    className={`btn btn-${params.row.active ? "secondary" : "success"} btn-sm mr-2`}
                    onClick={() => toggleStudentStatus(params.row.id)}
                >
                    {params.row.active ? "Deactivate" : "Activate"}
                </button>
            )
        },
        {
            field: "actions",
            headerName: "Actions",
            flex: 1,
            renderCell: (params) => (
                <div>
                    <button
                        className="btn btn-primary btn-sm mr-2"
                        onClick={() => openEditForm(params.row)}
                    >
                        Edit
                    </button>&nbsp;
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteStudent(params.row.id)}
                    >
                        Delete
                    </button>
                </div>
            ),
        },
    ];

    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
      setFile(e.target.files[0]);
    };
  
    const handleUpload = async () => {
      if (!file) {
        alert("Please select a file first.");
        return;
      }
      const formData = new FormData();
      formData.append("file", file);
  
      try {
        const response =  await axios.post(`${API_URL}/users/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert(response.data);
      } catch (error) {
        console.error("Upload error:", error);
        alert("Failed to upload file");
      }
    };

    return (
        <div>
            <ToastContainer />
            <h1 className="text-center mb-4">Manage Students</h1>

            {/* Search Input */}
            <div className="d-flex justify-content-between mb-4">
                <input
                    type="text"
                    placeholder="Search Students"
                    className="form-control"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <button className="btn btn-primary ml-4" onClick={() => toggleModal(true)}>
                    Add Student
                </button>
                <div>
                    <input type="file" accept=".xlsx" onChange={handleFileChange} />
                    <button onClick={handleUpload}>Upload</button>
                </div>
                <Dropdown
                    isOpen={exportDropdownOpen}
                    toggle={toggleExportDropdown}
                    className="ml-4"
                >
                    <DropdownToggle className="btn btn-success" style={{ height: "63px" }}>
                        Export
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem onClick={exportToCSV}>
                            <FontAwesomeIcon icon={faFileCsv} className="mr-2" />
                            CSV
                        </DropdownItem>
                        <DropdownItem onClick={exportToExcel}>
                            <FontAwesomeIcon icon={faFileExcel} className="mr-2" />
                            Excel
                        </DropdownItem>
                        <DropdownItem onClick={exportToPDF}>
                            <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
                            PDF
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
            {/* DataGrid */}
            <div style={{ width: "100%" }}>
                <DataGrid
                    rows={filteredData}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[5, 10, 15]}
                    // initialState={{
                    //     sorting: {
                    //         sortModel: [{ field: "id", sort: "asc" }], // Initial sorting by ID ascending
                    //     },
                    // }}
                />
            </div>

            {/* Modal */}
            <Modal isOpen={isModalOpen} toggle={toggleModal}>
                <div className="modal-content">
                    <div className="modal-header">
                        {isEditing ? "Edit Student" : "Add Student"}
                    </div>
                    <div className="modal-body">
                        <form>
                            <div className="form-group">
                                <label>Name: *</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                                    name="name"
                                    value={newStudent.name}
                                    onChange={handleInputChange}
                                />
                                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                            </div>
                            <div className="form-group">
                                <label>Email: *</label>
                                <input
                                    type="email"
                                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                                    name="email"
                                    value={newStudent.email}
                                    onChange={handleInputChange}
                                />
                                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                            </div>
                            {!isEditing && (
                                <div className="form-group">
                                    <label>Password: *</label>
                                    <input
                                        type="password"
                                        className={`form-control ${errors.password ? "is-invalid" : ""}`}
                                        name="password"
                                        value={newStudent.password}
                                        onChange={handleInputChange}
                                    />
                                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                                </div>
                            )}
                            <div className="form-group">
                                <label>Phone: *</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                                    name="phone"
                                    value={newStudent.phone}
                                    onChange={handleInputChange}
                                />
                                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                            </div>
                            <div className="form-group">
                                <label>Address: *</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.address ? "is-invalid" : ""}`}
                                    name="address"
                                    value={newStudent.address}
                                    onChange={handleInputChange}
                                />
                                {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                            </div>
                            <div className="form-group">
                                <label>College: *</label>
                                <select
                                    className={`form-control ${errors.college ? "is-invalid" : ""}`}
                                    name="college"
                                    value={newStudent.college.id}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select College</option>
                                    {collegesData.map((college) => (
                                        <option key={college.id} value={college.id}>
                                            {college.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.college && <div className="invalid-feedback">{errors.college}</div>}
                            </div>
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={toggleModal}>
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={saveStudent}>
                            {isEditing ? "Edit" : "Add"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Student;
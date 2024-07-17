import React, { useState } from 'react';
import './CertificateForm.css'
import axios from 'axios';

const CertificateForm = () => {
    const [name, setName] = useState('');
    const [course, setCourse] = useState('');
    const [date, setDate] = useState('');
    const [email, setEmail] = useState('');
    const [certificates, setCertificates] = useState([]);
    const [show, setShow] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setShow(true);
        try {
            const response = await axios.post(`/certificates/generate`, { name, course, date, email });
            setCertificates([...certificates, response.data]);
            setShow(false);
        } catch (error) {
            console.log('Error',error);
            setShow(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
                <input type="text" value={course} onChange={(e) => setCourse(e.target.value)} placeholder="Course" required />
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
                <button type="submit">Generate Certificate</button>
            </form>
            <div>
                <h2>Generated Certificates</h2>
                <ul>
                    {certificates.map(cert => (
                        <li key={cert._id}>
                            <a href={cert.pdfLink} target="_blank" >{cert.name} - {cert.course}</a>
                        </li>
                    ))}
                    {show && <h3>Loading...</h3>}
                </ul>
            </div>
        </div>
    );
};

export default CertificateForm;

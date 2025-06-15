import React from 'react';

const Footer = () => {
    return (
        <footer className="footer p-10 bg-base-200 text-base-content">
            <div>
                <h2 className="footer-title">About</h2>
                <p>We are a platform connecting job seekers with employers.</p>
            </div>
            <div>
                <h2 className="footer-title">Social</h2>
                <a href="#" className="link link-hover">Facebook</a>
                <a href="#" className="link link-hover">Twitter</a>
                <a href="#" className="link link-hover">LinkedIn</a>
            </div>
            <div>
                <h2 className="footer-title">Contact</h2>
                <p>Email: support@example.com</p>
                <p>Phone: +123 456 7890</p>
            </div>
        </footer>
    );
};

export default Footer;
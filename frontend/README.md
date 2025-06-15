# Frontend Project - Final Web Lanjutan A

This is the frontend project for the Final Web Lanjutan A application, built using React and DaisyUI.

## Project Structure

```
frontend
├── public
│   ├── index.html
│   └── favicon.ico
├── src
│   ├── components
│   │   ├── Auth
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── Dashboard
│   │   │   └── Dashboard.jsx
│   │   ├── JobPosts
│   │   │   ├── JobPostList.jsx
│   │   │   ├── JobPostDetail.jsx
│   │   │   └── CreateJobPost.jsx
│   │   ├── Applications
│   │   │   ├── ApplicationList.jsx
│   │   │   └── ApplicationForm.jsx
│   │   ├── Profile
│   │   │   ├── ProfileView.jsx
│   │   │   └── ProfileEdit.jsx
│   │   └── Layout
│   │       ├── Header.jsx
│   │       ├── Footer.jsx
│   │       └── Sidebar.jsx
│   ├── pages
│   │   ├── Home.jsx
│   │   ├── Jobs.jsx
│   │   ├── MyApplications.jsx
│   │   └── Profile.jsx
│   ├── services
│   │   ├── api.js
│   │   ├── auth.js
│   │   └── jobPosts.js
│   ├── utils
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── hooks
│   │   ├── useAuth.js
│   │   └── useApi.js
│   ├── context
│   │   └── AuthContext.js
│   ├── App.jsx
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
└── README.md
```

## Setup Instructions

1. **Install Dependencies**:
   Run the following commands to install the necessary dependencies:

   ```bash
   npm install react react-dom
   npm install daisyui
   npm install tailwindcss postcss autoprefixer
   npm install react-router-dom axios
   ```

2. **Configure Tailwind CSS**:
   Create a `tailwind.config.js` file and include the necessary directives in your CSS files.

3. **Run the Application**:
   After setting up, you can start the application using:

   ```bash
   npm start
   ```

## Documentation

For more information on how to use the components and services, refer to the individual files in the `src` directory.
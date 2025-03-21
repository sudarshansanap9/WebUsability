
import React from 'react';
export default function Homepage(props)  {
  return (
  
    <div style={styles.container} className='p-2'>
      <div style={styles.logoContainer}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 64 64"
          style={styles.logo}
        >
          <polygon points="16,32 0,64 32,64" fill="#0056D2" />
          <polygon points="32,0 32,32 0,32" fill="#0056D2" />
        </svg>
        <h1 style={styles.title}>Website Usability Using AI</h1>
      </div>
      <p style={styles.subtitle} className={`text-${props.mode === 'light' ? 'dark' : 'light'} `}>
        Analyse suspicious files, domains, IPs and URLs to detect malware and other breaches, 
        automatically share them with the security community.
      </p>
    </div>

  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop:"180px",
    marginBottom:"0px",
    
    backgroundColor: 'transparent',
    textAlign: 'center',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    width: '80px',
    height: '80px',
  },
  title: {
    marginLeft: '20px',
    color: '#0056D2',
    fontSize: '48px',
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: '20px',
    color: '#333333',
    fontSize: '16px',
    maxWidth: '600px',
  },
};


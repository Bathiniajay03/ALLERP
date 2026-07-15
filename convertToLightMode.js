const fs = require('fs');
const path = require('path');

const filesToProcess = [
  'src/pages/LandingPage.jsx',
  'src/pages/SignupWizard.jsx',
  'src/pages/CompanyLoginPage.jsx',
  'src/components/landing/Navbar.jsx',
  'src/components/landing/HeroSection.jsx',
  'src/components/landing/StatsSection.jsx',
  'src/components/landing/FeaturesSection.jsx',
  'src/components/landing/EnterpriseWorkflow.jsx',
  'src/components/landing/WhyChooseUs.jsx',
  'src/components/landing/IndustriesSection.jsx',
  'src/components/landing/CarouselSection.jsx',
  'src/components/landing/PricingSection.jsx',
  'src/components/landing/Footer.jsx'
];

const basePath = 'C:\\OldOs\\MyMain\\MysqlWorkbenchboth\\01-04-26\\product-erp3';

filesToProcess.forEach(file => {
  const filePath = path.join(basePath, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // LandingPage.jsx specific
    if (file.includes('LandingPage.jsx')) {
      content = content.replace(/--bs-dark:\s*#09090b;/, '--bs-dark: #ffffff;');
      content = content.replace(/--bs-dark-rgb:\s*9,9,11;/, '--bs-dark-rgb: 255,255,255;');
      content = content.replace(/color:\s*#f8fafc;/, 'color: #0f172a;');
    }
    
    // Navbar specific
    if (file.includes('Navbar.jsx')) {
      content = content.replace(/filter:\s*'invert\(1\)'/, "filter: 'invert(0)'");
      content = content.replace(/rgba\(10,\s*10,\s*10,\s*0\.8\)/g, 'rgba(255, 255, 255, 0.8)');
    }

    // General string replacements for classes and colors
    content = content.replace(/\bbg-dark\b/g, 'bg-white');
    content = content.replace(/\btext-light\b/g, 'text-dark');
    content = content.replace(/\btext-white\b/g, 'text-dark'); 
    
    // Buttons
    content = content.replace(/\bbtn-outline-light\b/g, 'btn-outline-dark');
    
    // Borders
    content = content.replace(/\bborder-secondary\b/g, 'border-light-subtle');
    
    // Backgrounds
    content = content.replace(/\bbg-secondary\b/g, 'bg-light');
    
    // RGBA Transparency adjustments (White to Black)
    content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.02\)/g, 'rgba(0,0,0,0.02)');
    content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.03\)/g, 'rgba(0,0,0,0.03)');
    content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.05\)/g, 'rgba(0,0,0,0.05)');
    content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.08\)/g, 'rgba(0,0,0,0.08)');
    content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.1\)/g, 'rgba(0,0,0,0.1)');
    
    // Glassmorphism specific color swaps
    content = content.replace(/rgba\(24,\s*24,\s*27,\s*0\.6\)/g, 'rgba(255, 255, 255, 0.7)');
    content = content.replace(/rgba\(20,\s*20,\s*22,\s*0\.7\)/g, 'rgba(255, 255, 255, 0.8)');
    content = content.replace(/radial-gradient\(circle at 50% -20%, #1a1a2e, #0f0f13\)/g, 'radial-gradient(circle at 50% -20%, #f8fafc, #e2e8f0)');
    
    // Stats Section gradient
    content = content.replace(/rgba\(10,10,10,0\.9\)/g, 'rgba(248,250,252,1)');
    content = content.replace(/rgba\(20,20,20,0\.9\)/g, 'rgba(241,245,249,1)');
    
    // Carousel Macbook
    if (file.includes('CarouselSection.jsx')) {
      content = content.replace(/background:\s*'#1a1a1a'/g, "background: '#e5e5e5'");
      content = content.replace(/border:\s*'1px solid #333'/g, "border: '1px solid #ccc'");
      content = content.replace(/#2a2a2a,\s*#111/g, '#f1f1f1, #d1d1d1');
      // Ensure text on images stays white
      content = content.replace(/text-dark fw-bold m-0 text-start/g, 'text-white fw-bold m-0 text-start');
    }
    
    // Industries Image text
    if (file.includes('IndustriesSection.jsx')) {
      content = content.replace(/text-dark fw-bold fs-6 text-uppercase/g, 'text-white fw-bold fs-6 text-uppercase');
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated: ' + file);
  }
});

const fs = require('fs');
const path = 'src/pages/LandingPage.jsx';
let content = fs.readFileSync(path, 'utf8');

const useCaseCss = `
  /* Use Cases Grid */
  .erp-use-cases-grid { display: flex; flex-direction: column; gap: 24px; }
  .erp-use-case-card { display: flex; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(9,30,66,0.04); transition: transform 0.4s; border: 1px solid var(--erp-glass-border); }
  .erp-use-case-card:hover { transform: scale(1.02); box-shadow: 0 20px 40px rgba(0,82,204,0.1); }
  .erp-use-case-visual { width: 250px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
  .erp-use-case-visual::after { content: ''; position: absolute; inset: 0; background: linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent); transform: translateX(-100%); transition: transform 0.6s; }
  .erp-use-case-card:hover .erp-use-case-visual::after { transform: translateX(100%); }
  .erp-use-case-content { flex: 1; padding: 40px; }
  .erp-use-case-content h4 { font-size: 1.5rem; font-weight: 800; color: var(--erp-secondary); margin: 0 0 16px; }
  .erp-use-case-content p { font-size: 1.1rem; color: var(--erp-text-muted); margin: 0; line-height: 1.6; }
  
  @media (max-width: 768px) {
    .erp-use-case-card { flex-direction: column; }
    .erp-use-case-visual { width: 100%; height: 160px; }
    .erp-use-case-content { padding: 24px; }
  }
`;

const useCaseHtml = `
      {/* Use Cases Section */}
      <section className="erp-section animate-on-scroll" id="use-cases" style={{ background: 'var(--erp-glass)', position: 'relative' }}>
        <div className="erp-section-header">
          <h2>Built for Real-World Operations</h2>
          <p>Discover how modern enterprises leverage SmartERP to eliminate bottlenecks.</p>
        </div>
        <div className="erp-use-cases-grid">
          <div className="erp-use-case-card">
            <div className="erp-use-case-visual" style={{ background: 'linear-gradient(135deg, #0052cc, #00b8d9)' }}>
              <div style={{ fontSize: '4rem' }}>🏭</div>
            </div>
            <div className="erp-use-case-content">
              <h4>Manufacturing & Assembly</h4>
              <p>Track raw materials from receiving dock to Work-In-Progress (WIP). Automatically generate Bills of Materials (BOM) and enforce rigid lot-tracking to ensure FDA/ISO regulatory compliance across the entire assembly line.</p>
            </div>
          </div>
          <div className="erp-use-case-card">
            <div className="erp-use-case-visual" style={{ background: 'linear-gradient(135deg, #ff5f56, #ff9a44)' }}>
              <div style={{ fontSize: '4rem' }}>📦</div>
            </div>
            <div className="erp-use-case-content">
              <h4>High-Volume E-Commerce</h4>
              <p>Eliminate costly mis-picks with strictly enforced FIFO (First-In, First-Out) dispatching logic. Mobile barcode scanners guide packers through optimal aisle routes to slash fulfillment times by up to 60%.</p>
            </div>
          </div>
          <div className="erp-use-case-card">
            <div className="erp-use-case-visual" style={{ background: 'linear-gradient(135deg, #27c93f, #00a8ff)' }}>
              <div style={{ fontSize: '4rem' }}>🌐</div>
            </div>
            <div className="erp-use-case-content">
              <h4>Multi-Region Logistics</h4>
              <p>Seamlessly transfer inventory between global warehouses in real-time. Maintain absolute visibility into deep hierarchical storage locations including Zones, Aisles, Racks, Shelves, and individual Bins.</p>
            </div>
          </div>
        </div>
      </section>

`;

// Inject CSS
content = content.replace('/* Features Split */', useCaseCss + '\n  /* Features Split */');

// Inject HTML
content = content.replace('{/* Deep Dive Feature */}', useCaseHtml + '{/* Deep Dive Feature */}');

fs.writeFileSync(path, content);
console.log("Successfully injected Use Cases");

"use client";

import { useState, useEffect } from 'react';

export default function TokenInfo() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Token details as per project specifications
  const tokenDetails = [
    { label: "Token Name", value: "BRAINROT" },
    { label: "Symbol", value: "$ROT" },
    { label: "Total Supply", value: "7,777,777,777" },
    { label: "Presale Price", value: "1 SOL = 1M $ROT" },
    { label: "Launch Price", value: "1 SOL = 500K $ROT" },
  ];

  // Distribution data as per project specifications
  const distribution = [
    { label: "Presale", percentage: "33.3%", tokens: "2.59B $ROT" },
    { label: "Liquidity", percentage: "25%", tokens: "1.94B $ROT" },
    { label: "Marketing", percentage: "20%", tokens: "1.56B $ROT" },
    { label: "Team", percentage: "10%", tokens: "777M $ROT" },
    { label: "Development", percentage: "11.7%", tokens: "910M $ROT" },
  ];

  return (
    <div 
      id="tokenomics"
      style={{
        background: 'rgba(10, 5, 20, 0.9)',
        borderRadius: '15px',
        padding: isMobile ? '1rem' : '2rem',
        margin: isMobile ? '1rem' : '2rem auto',
        border: '1px solid rgba(138, 43, 226, 0.5)',
        boxShadow: '0 0 20px rgba(138, 43, 226, 0.3)',
        maxWidth: '100%',
        overflowX: 'hidden'
      }}
    >
      <h2 style={{
        fontSize: isMobile ? '1.75rem' : '2.5rem',
        fontWeight: 'bold',
        marginBottom: isMobile ? '1rem' : '2rem',
        color: '#8a2be2',
        textShadow: '0 0 10px rgba(138, 43, 226, 0.7)',
        textAlign: 'center',
        wordBreak: 'break-word'
      }}>
        Tokenomics
      </h2>
      
      <div style={{
        display: 'flex',
        flexDirection: window.innerWidth < 768 ? 'column' : 'row',
        flexWrap: 'wrap',
        gap: window.innerWidth < 768 ? '1rem' : '2rem',
        justifyContent: 'center',
        padding: window.innerWidth < 768 ? '0.5rem' : '1rem'
      }}>
        {/* Left Column - Distribution Pie Chart Visualization */}
        <div style={{
          flex: '1',
          minWidth: '300px',
          maxWidth: '500px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '15px',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h3 style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            color: '#ff2d95',
            textAlign: 'center'
          }}>
            Distribution
          </h3>
          
          {/* Pie Chart Visualization (simplified representation) */}
          <div style={{
            position: 'relative',
            width: '250px',
            height: '250px',
            margin: '0 auto 2rem',
            borderRadius: '50%',
            background: `conic-gradient(
              #ff2d95 0% 33.3%,
              #8a2be2 33.3% 58.3%,
              #00dbde 58.3% 78.3%,
              #ff5e00 78.3% 88.3%,
              #00ff9d 88.3% 100%
            )`,
            boxShadow: '0 0 20px rgba(138, 43, 226, 0.5)'
          }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#8a2be2'
                }}>
                  7.78B
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#aaa'
                }}>
                  Total Supply
                </div>
              </div>
            </div>
          </div>
          
          {/* Distribution Legend */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem'
          }}>
            {distribution.map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: index === 0 ? '#ff2d95' : 
                              index === 1 ? '#8a2be2' :
                              index === 2 ? '#00dbde' :
                              index === 3 ? '#ff5e00' : '#00ff9d'
                  }}></div>
                  <span style={{ color: '#ddd' }}>{item.label}</span>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '1rem'
                }}>
                  <span style={{ color: '#ff2d95', fontWeight: 'bold' }}>{item.percentage}</span>
                  <span style={{ color: '#aaa' }}>{item.tokens}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Right Column - Token Details */}
        <div style={{
          flex: '1',
          minWidth: '300px',
          maxWidth: '500px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '15px',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h3 style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            color: '#00dbde',
            textAlign: 'center'
          }}>
            Token Details
          </h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {tokenDetails.map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '1rem',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '8px',
                border: '1px solid rgba(0, 219, 222, 0.2)'
              }}>
                <span style={{ color: '#aaa' }}>{item.label}</span>
                <span style={{ 
                  color: '#00dbde', 
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
          
          {/* Contract Address Section */}
          <div style={{
            marginTop: window.innerWidth < 768 ? '1rem' : '2rem',
            padding: window.innerWidth < 768 ? '1rem' : '1.5rem',
            background: 'linear-gradient(135deg, rgba(138,43,226,0.2), rgba(0,219,222,0.2))',
            borderRadius: '12px',
            border: '1px solid rgba(138, 43, 226, 0.3)',
            maxWidth: '100%',
            wordBreak: 'break-all'
          }}>
            <h4 style={{
              fontSize: '1.3rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: '#8a2be2',
              textAlign: 'center'
            }}>
              Support Dev
            </h4>
            <div style={{
              background: 'rgba(0,0,0,0.5)',
              borderRadius: '8px',
              padding: '1rem',
              position: 'relative',
              cursor: 'pointer'
            }}
            onClick={() => {
              navigator.clipboard.writeText('DzNvVANS3MrUdsv9ZoTcEFCvRoM5gkNodp6bTmUgd67U');
              const tooltip = document.getElementById('copyTooltip');
              if (tooltip) {
                tooltip.style.opacity = '1';
                setTimeout(() => {
                  tooltip.style.opacity = '0';
                }, 2000);
              }
            }}>
              <div style={{
                textAlign: 'center',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                color: '#00dbde',
                wordBreak: 'break-all'
              }}>
                DzNvVANS3MrUdsv9ZoTcEFCvRoM5gkNodp6bTmUgd67U
              </div>
              <div id="copyTooltip" style={{
                position: 'absolute',
                top: '-30px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#8a2be2',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                opacity: '0',
                transition: 'opacity 0.3s',
                pointerEvents: 'none'
              }}>
                Copied!
              </div>
            </div>
            <p style={{
              color: '#aaa',
              fontSize: '0.9rem',
              textAlign: 'center',
              marginTop: '1rem'
            }}>
              Always verify the contract address before making any transactions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
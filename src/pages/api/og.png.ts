import type { APIRoute } from 'astro';
import { ImageResponse } from '@vercel/og';
import fs from 'node:fs';
import path from 'node:path';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const title = url.searchParams.get('title') || 'Chris Lacey';
  const subtitle = url.searchParams.get('subtitle') || 'Senior Software Engineer';

  // Load headshot image - try multiple paths
  const possiblePaths = [
    path.resolve('./src/assets/headshot.jpeg'),
    path.resolve('src/assets/headshot.jpeg'),
    path.join(process.cwd(), 'src/assets/headshot.jpeg'),
    path.resolve('./dist/client/_astro/headshot.jpeg'),
    path.resolve('./dist/assets/headshot.jpeg'),
  ];

  let imageSrc = '';
  for (const imagePath of possiblePaths) {
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      imageSrc = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
      break;
    } catch {
      // Try next path
    }
  }

  const html = {
    type: 'div',
    props: {
      style: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#0F0F16',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        position: 'relative',
        overflow: 'hidden',
      },
      children: [
        // Ambient glow - top left (teal) - using radial gradient since blur isn't supported
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '-200px',
              left: '-200px',
              width: '600px',
              height: '600px',
              background: 'radial-gradient(circle, rgba(45, 212, 191, 0.12) 0%, transparent 70%)',
            },
          },
        },
        // Ambient glow - bottom right (purple)
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              bottom: '-250px',
              right: '-200px',
              width: '700px',
              height: '700px',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
            },
          },
        },
        // Main content container
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '60px',
              padding: '60px',
            },
            children: [
              // Left side - Text content
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    maxWidth: '550px',
                  },
                  children: [
                    // Name
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '72px',
                          fontWeight: '700',
                          color: '#ffffff',
                          lineHeight: '1.1',
                          marginBottom: '16px',
                        },
                        children: title,
                      },
                    },
                    // Role with teal accent
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '32px',
                          fontWeight: '500',
                          color: '#2dd4bf',
                          marginBottom: '24px',
                        },
                        children: subtitle,
                      },
                    },
                    // Tagline
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '20px',
                          fontWeight: '400',
                          color: '#A0A0B0',
                          lineHeight: '1.5',
                        },
                        children: 'Building complex systems with clarity, correctness, and long-term maintainability.',
                      },
                    },
                  ],
                },
              },
              // Right side - Headshot with glow
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  },
                  children: [
                    // Glow behind image
                    {
                      type: 'div',
                      props: {
                        style: {
                          position: 'absolute',
                          width: '320px',
                          height: '320px',
                          background: 'radial-gradient(circle, rgba(45, 212, 191, 0.3) 0%, transparent 70%)',
                        },
                      },
                    },
                    // Border ring - solid teal like home page
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '280px',
                          height: '280px',
                          borderRadius: '140px',
                          background: '#2dd4bf',
                          padding: '4px',
                        },
                        children: imageSrc ? {
                          type: 'img',
                          props: {
                            src: imageSrc,
                            width: 272,
                            height: 272,
                            style: {
                              borderRadius: '136px',
                            },
                          },
                        } : {
                          type: 'div',
                          props: {
                            style: {
                              width: '272px',
                              height: '272px',
                              borderRadius: '136px',
                              background: '#1a1a2e',
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        // Footer - domain
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              bottom: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '18px',
                    fontWeight: '500',
                    color: '#A0A0B0',
                  },
                  children: 'chrislacey.dev',
                },
              },
            ],
          },
        },
      ],
    },
  };

  return new ImageResponse(html as React.ReactElement, {
    width: 1200,
    height: 630,
  });
};

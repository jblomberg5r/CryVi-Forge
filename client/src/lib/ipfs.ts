import { create } from 'ipfs-http-client';

// IPFS Gateway configuration
// Default to using Infura IPFS service - can be replaced with user configuration
export const IPFS_GATEWAY_URL = 'https://ipfs.io/ipfs/';

// Initialize the IPFS client
export const initIPFSClient = (projectId?: string, projectSecret?: string) => {
  // If API credentials are provided, use authenticated client
  if (projectId && projectSecret) {
    const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
    
    return create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      headers: {
        authorization: auth,
      },
    });
  }
  
  // For public gateway access (limited functionality)
  return create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
  });
};

// Function to add a file to IPFS
export const addFileToIPFS = async (file: File, client: any) => {
  try {
    const fileAdded = await client.add(file);
    return {
      success: true,
      hash: fileAdded.path,
      url: `${IPFS_GATEWAY_URL}${fileAdded.path}`,
      size: fileAdded.size,
    };
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    return {
      success: false,
      error,
    };
  }
};

// Function to add content to IPFS
export const addContentToIPFS = async (content: string, client: any) => {
  try {
    const contentAdded = await client.add(JSON.stringify(content));
    return {
      success: true,
      hash: contentAdded.path,
      url: `${IPFS_GATEWAY_URL}${contentAdded.path}`,
      size: contentAdded.size,
    };
  } catch (error) {
    console.error('Error uploading content to IPFS:', error);
    return {
      success: false,
      error,
    };
  }
};

// Function to get content from IPFS
export const getFromIPFS = async (cid: string, client: any) => {
  try {
    const stream = client.cat(cid);
    let data = '';
    
    for await (const chunk of stream) {
      data += new TextDecoder().decode(chunk);
    }
    
    try {
      // Try to parse as JSON if possible
      return {
        success: true,
        data: JSON.parse(data),
      };
    } catch (e) {
      // Return as string if not JSON
      return {
        success: true,
        data,
      };
    }
  } catch (error) {
    console.error('Error retrieving data from IPFS:', error);
    return {
      success: false,
      error,
    };
  }
};

// Function to pin content to IPFS to ensure it remains available
export const pinToIPFS = async (cid: string, client: any) => {
  try {
    await client.pin.add(cid);
    return {
      success: true,
      hash: cid,
    };
  } catch (error) {
    console.error('Error pinning content to IPFS:', error);
    return {
      success: false,
      error,
    };
  }
};

// Function to get gateway URL for a CID
export const getIPFSUrl = (cid: string): string => {
  return `${IPFS_GATEWAY_URL}${cid}`;
};
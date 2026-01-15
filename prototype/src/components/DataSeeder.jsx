import React, { useState } from 'react';
import { db } from '../firebase';
import { halls } from '../data/mockData';
import { writeBatch, doc, collection } from 'firebase/firestore';

const DataSeeder = () => {
    const [status, setStatus] = useState('Idle');
    const [progress, setProgress] = useState(0);

    const seedData = async () => {
        if (!confirm("This will overwrite/add 100+ venues to your Firestore 'halls' collection. Continue?")) return;

        setStatus('Starting...');
        try {
            // Firestore batch limit is 500. We have ~120, so one batch is fine, 
            // but let's chunk it just to be safe and scalable.
            const batchSize = 400;
            const chunks = [];

            for (let i = 0; i < halls.length; i += batchSize) {
                chunks.push(halls.slice(i, i + batchSize));
            }

            let totalUploaded = 0;

            for (const chunk of chunks) {
                const batch = writeBatch(db);
                chunk.forEach(hall => {
                    // Use 'hall.id' as the document ID for consistency
                    const docRef = doc(db, "halls", hall.id.toString());
                    batch.set(docRef, hall);
                });
                await batch.commit();
                totalUploaded += chunk.length;
                setProgress(Math.round((totalUploaded / halls.length) * 100));
            }

            setStatus('Success! Database Populated.');
        } catch (error) {
            console.error(error);
            setStatus(`Error: ${error.message}`);
        }
    };

    return (
        <div style={{ padding: '4rem', textAlign: 'center' }}>
            <h1>Database Seeder</h1>
            <p>Use this tool to upload your mock data to Firebase Firestore.</p>

            <div style={{ margin: '2rem 0', padding: '2rem', background: '#f3f4f6', borderRadius: '12px' }}>
                <h2>{halls.length} Venues Ready</h2>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '1rem 0', color: status.includes('Error') ? 'red' : 'green' }}>
                    {status}
                </div>
                {progress > 0 && <div>Progress: {progress}%</div>}
            </div>

            <button
                onClick={seedData}
                className="btn-primary"
                disabled={status === 'Starting...'}
                style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}
            >
                {status === 'Starting...' ? 'Uploading...' : 'Seed Database Now'}
            </button>
        </div>
    );
};

export default DataSeeder;

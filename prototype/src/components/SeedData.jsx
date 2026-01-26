import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, writeBatch, doc, getDocs } from 'firebase/firestore';
import { halls } from '../data/mockData';
import { ShieldCheck, Trash2, Database, Check, AlertTriangle, Loader2 } from 'lucide-react';

export default function SeedData() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [progress, setProgress] = useState(0);
    const [stats, setStats] = useState(null);

    const seedDatabase = async () => {
        if (!window.confirm(`Are you sure you want to add ${halls.length} venues to Firestore?`)) return;

        setLoading(true);
        setStatus('Starting seed process...');
        setProgress(0);

        try {
            const batchSize = 500; // Firestore batch limit is 500
            let batch = writeBatch(db);
            let count = 0;
            let totalAdded = 0;

            for (const hall of halls) {
                // Create a new doc reference with a generated ID or use specific logic
                // Using hall.id from mock data ensures idempotency if we use it as doc ID
                const docRef = doc(db, 'halls', `mock_${hall.id}`);

                // Add to batch
                batch.set(docRef, {
                    ...hall,
                    createdAt: new Date().toISOString()
                });

                count++;
                totalAdded++;

                // Commit batch if limit reached
                if (count >= batchSize) {
                    await batch.commit();
                    batch = writeBatch(db);
                    count = 0;
                    setProgress(Math.round((totalAdded / halls.length) * 100));
                }
            }

            // Commit remaining
            if (count > 0) {
                await batch.commit();
            }

            setStatus('Success! Database seeded.');
            setProgress(100);
            setStats({ total: totalAdded });
        } catch (error) {
            console.error("Error seeding data:", error);
            setStatus(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const clearDatabase = async () => {
        if (!window.confirm("WARNING: This will DELETE ALL mock venues (IDs starting with 'mock_'). Continue?")) return;

        setLoading(true);
        setStatus('Clearing mock data...');

        try {
            const q = collection(db, "halls");
            const snapshot = await getDocs(q);

            let batch = writeBatch(db);
            let count = 0;
            let deletedCount = 0;

            for (const document of snapshot.docs) {
                // Only delete mock data to be safe, or all if intended. 
                // For safety, let's look for known mock keys or just delete all if user is sure.
                // The prompt implies "implementation" of dummy data, so let's check ID.
                if (document.id.startsWith('mock_')) {
                    batch.delete(document.ref);
                    count++;
                    deletedCount++;
                }

                if (count >= 400) {
                    await batch.commit();
                    batch = writeBatch(db);
                    count = 0;
                }
            }

            if (count > 0) {
                await batch.commit();
            }

            setStatus(`Cleared ${deletedCount} mock venues.`);
            setStats(null);
        } catch (error) {
            console.error("Error clearing data:", error);
            setStatus(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '4rem 1rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <div className="card" style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                    <Database size={48} color="var(--color-primary)" />
                </div>
                <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#1f2937' }}>Database Seeder Tool</h1>
                <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                    Use this tool to populate your Firestore database with {halls.length} mock venues.
                </p>

                {status && (
                    <div style={{
                        padding: '1rem',
                        background: status.includes('Error') ? '#fef2f2' : '#f0fdf4',
                        color: status.includes('Error') ? '#991b1b' : '#166534',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        fontWeight: 500
                    }}>
                        {status}
                    </div>
                )}

                {loading && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${progress}%`, background: 'var(--color-primary)', height: '100%', transition: 'width 0.3s ease' }}></div>
                        </div>
                        <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#6b7280' }}>Processing... {progress}%</p>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <button
                        onClick={seedDatabase}
                        disabled={loading}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                        Seed Database
                    </button>

                    <button
                        onClick={clearDatabase}
                        disabled={loading}
                        style={{
                            background: '#fee2e2', color: '#b91c1c', border: 'none',
                            padding: '0.75rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                    >
                        <Trash2 size={20} />
                        Clear Mock Data
                    </button>
                </div>

                {stats && (
                    <div id="seed-success-msg" style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6', textAlign: 'left' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Check size={18} color="#166534" />
                            Ready to rock!
                        </h4>
                        <p style={{ fontSize: '0.9rem', color: '#4b5563' }}>
                            Successfully added <strong>{stats.total}</strong> venues.
                            Head over to the <a href="/customer">Home Page</a> to see them.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

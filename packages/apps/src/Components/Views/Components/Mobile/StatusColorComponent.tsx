
export const StatusColorComponent: React.FC<{ color?: string }> = ({ color = 'currentColor' }) => (
    <svg height="24" width="24" style={{ marginBottom: '5px', marginTop:'5px' }}>
        <circle cx="12" cy="12" r="10" fill={color} />
    </svg>
)
export default function AdPlaceholder({ className }: { className?: string }) {
    return (
        <div className={`w-full h-32 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white/20 text-sm ${className}`}>
            Advertisement Placeholder
        </div>
    );
}

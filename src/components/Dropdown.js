
const Dropdown = ({ options, onSelect }) => {
    const [selectedValue, setSelectedValue] = useState('');

    function handleChange(event) {
        // console.log(event.target)
        const value = event.target.value;
        const selectedIndex = event.target.selectedIndex;
        if (selectedIndex == 0) return;
        setSelectedValue(value);
        onSelect(value, selectedIndex);
    }

    return (
        <select value={selectedValue} onChange={handleChange} style={{
            maxWidth: '300px'
        }}>
            <option value="" style={{
                paddingLeft: '10px'
            }}>-- 請選擇 --</option>
            {options.map((option, index) => (
                <option key={index} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
}

export default Dropdown
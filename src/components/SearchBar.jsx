export default function SearchBar({placeholder, onSearch}){
    return (
        <input type = "text" placeholder = {placeholder} onChange = {(e) => onSearch(e.target.value)} style = {{width: "100%", padding: "10px", marginBottom: "15px", borderRadius: "5px", border: "1px"}}/>
    );
}

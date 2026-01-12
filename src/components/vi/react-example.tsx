import r2wc from "@r2wc/react-to-web-component"

interface WelcomeProps {
    name: string;
}

const Welcome: React.FC<WelcomeProps> = ({ name }) => {
    return <span>Hello, {name}!</span>;
};

export default r2wc(Welcome, {
    props: {
        name: "string",
    }
});
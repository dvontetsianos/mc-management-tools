import Plot from "react-plotly.js";

function SurfaceChart({ history }) {

    const timeData = history.map((item) => item.time);

    const cpuData = history.map((item) => item.cpu);

    const memoryData = history.map((item) => item.memory);

    const diskData = history.map((item) => item.disk);

    return (
        <Plot

            data={[
    {
        x: timeData,
        y: cpuData,
        type: "scatter",
        mode: "lines",
        name: "CPU"
    },

    {
        x: timeData,
        y: memoryData,
        type: "scatter",
        mode: "lines",
        name: "Memory"
    },

    {
        x: timeData,
        y: diskData,
        type: "scatter",
        mode: "lines",
        name: "Disk"
    }
]}

            layout={{
                title: "Hotel Operations 3D Surface",
                autosize: false,
                height: 800,
                width: 855,
                margin: {
                    1: 20,
                    r: 20,
                    t: 40,
                    b: 20
                }
            }}

        />
    );
}

export default SurfaceChart;
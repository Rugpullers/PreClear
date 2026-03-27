// Type declarations for leaflet image imports and leaflet-routing-machine
declare module 'leaflet/dist/images/marker-icon-2x.png' {
    const value: string;
    export default value;
}
declare module 'leaflet/dist/images/marker-icon.png' {
    const value: string;
    export default value;
}
declare module 'leaflet/dist/images/marker-shadow.png' {
    const value: string;
    export default value;
}

declare module 'leaflet-routing-machine' {
    import * as L from 'leaflet';

    namespace Routing {
        interface RoutingControlOptions extends L.ControlOptions {
            waypoints: L.LatLng[];
            lineOptions?: {
                styles?: L.PathOptions[];
                extendToWaypoints?: boolean;
                missingRouteTolerance?: number;
            };
            createMarker?: (
                i: number,
                waypoint: { latLng: L.LatLng },
                n: number
            ) => L.Marker | null;
            show?: boolean;
            addWaypoints?: boolean;
            routeWhileDragging?: boolean;
            fitSelectedRoutes?: boolean;
        }

        function control(options: RoutingControlOptions): Control;

        interface Control extends L.Control {
            getPlan(): unknown;
        }
    }

    export = Routing;
}

declare namespace L {
    namespace Routing {
        interface RoutingControlOptions extends L.ControlOptions {
            waypoints: L.LatLng[];
            lineOptions?: {
                styles?: L.PathOptions[];
                extendToWaypoints?: boolean;
                missingRouteTolerance?: number;
            };
            createMarker?: (
                i: number,
                waypoint: { latLng: L.LatLng },
                n: number
            ) => L.Marker | null;
            show?: boolean;
            addWaypoints?: boolean;
            routeWhileDragging?: boolean;
            fitSelectedRoutes?: boolean;
        }

        function control(options: RoutingControlOptions): Control;

        interface Control extends L.Control {
            getPlan(): unknown;
        }
    }
}

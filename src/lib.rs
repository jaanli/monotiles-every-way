use rand::Rng;
use svg::node::element::Path;
use svg::node::element::path::Data;
use svg::Document;
use pdf_canvas::Pdf;

pub struct Monotile {
    width: u32,
    height: u32,
    color: String,
}

impl Monotile {
    pub fn new(width: u32, height: u32, color: String) -> Self {
        Monotile {
            width,
            height,
            color,
        }
    }

    pub fn generate_svg(&self) -> Document {
        let mut data = Data::new();

        let mut rng = rand::thread_rng();
        let x = rng.gen_range(0..self.width);
        let y = rng.gen_range(0..self.height);

        data = data.move_to((x, y))
                   .line_by((self.width - x, 0))
                   .line_by((0, self.height - y))
                   .line_by((x - self.width, 0))
                   .close();

        let path = Path::new()
            .set("fill", self.color.clone())
            .set("stroke", "none")
            .set("d", data);

        Document::new()
            .set("viewBox", (0, 0, self.width, self.height))
            .set("width", self.width)
            .set("height", self.height)
            .add(path)
    }

    pub fn generate_pdf(&self) -> Pdf {
        let mut pdf = Pdf::create(self.width as f32, self.height as f32);

        let mut rng = rand::thread_rng();
        let x = rng.gen_range(0..self.width);
        let y = rng.gen_range(0..self.height);

        pdf.fill_color(self.color.clone())
           .begin_path()
           .move_to(x as f32, y as f32)
           .line_to((self.width - x) as f32, y as f32)
           .line_to((self.width - x) as f32, (self.height - y) as f32)
           .line_to(x as f32, (self.height - y) as f32)
           .close_path()
           .fill();

        pdf
    }
}

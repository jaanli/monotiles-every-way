use monotiles_every_way::Monotile;

fn main() {
    let monotile = Monotile::new(400, 400, "#ff0000".to_string());

    let svg = monotile.generate_svg();
    svg::save("monotile.svg", &svg).unwrap();

    let pdf = monotile.generate_pdf();
    pdf.save("monotile.pdf").unwrap();

    println!("Monotile generated successfully!");
}
